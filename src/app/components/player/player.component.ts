import { Component, OnInit, NgZone, ViewChild } from "@angular/core";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";
import { ipcRenderer, remote } from "electron";
import { videoExtensions } from "../../../static/config.js";
import { SideBarComponent } from "../side-bar/side-bar.component";
import { allPages, messageListener, tutor } from "easylang-extension";
import { StoreService } from "../../services/store.service";
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: "app-player",
    templateUrl: "./player.component.html",
    styleUrls: ["./player.component.scss"]
})
export class PlayerComponent implements OnInit {
    @ViewChild(SideBarComponent, undefined) sideBarComponent: SideBarComponent;
    public themeName: string;
    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        private _ngZone: NgZone,
        private storeService: StoreService,
        private themeService: ThemeService
    ) {
        console.log(storeService);
        this.onChangeTheme(storeService.store.get('theme') || 'dark');

        this.mpvService.stopAdditional = this.subtitlesService.clearSubtitles.bind(
            this.subtitlesService
        );
        ipcRenderer.on("open-file-with", (ev, arg) => {
            this.openFile(arg);
        });
        ipcRenderer.on("open-file", () => {
            this.openFile();
        });
        ipcRenderer.on("toggle-pause", () => {
            this.mpvService.togglePause();
        });
        ipcRenderer.on("fast-forward", () => {
            this.subtitlesService.setSubtitleNext();
        });
        ipcRenderer.on("fast-backward", () => {
            this.subtitlesService.setSubtitlePrev();
        });
        ipcRenderer.on("fast-repeat", () => {
            this.subtitlesService.setSubtitleRepeat();
        });
        ipcRenderer.on("speed-up", () => {
            this.mpvService.speedUp();
        });
        ipcRenderer.on("speed-down", () => {
            this.mpvService.speedDown();
        });
        ipcRenderer.on("speed-reset", () => {
            this.mpvService.speedReset();
        });
        ipcRenderer.on("clear-subtitles", () => {
            this.subtitlesService.clearSubtitles();
        });
        ipcRenderer.on("add-external-subtitle", () => {
            if (this.mpvService.state.duration)
                this.subtitlesService.loadSubtitles();
        });
        ipcRenderer.on("add-subtitle-shift", () => {
            this.subtitlesService.changeSubtitleShift(0.5);
        });
        ipcRenderer.on("reduce-subtitle-shift", () => {
            this.subtitlesService.changeSubtitleShift(-0.5);
        });
        ipcRenderer.on("reset-subtitle-shift", () => {
            this.subtitlesService.resetSubtitleShift();
        });
        ipcRenderer.on("toggle-full-screen", () => {
            this.mpvService.toggleFullscreen();
        });
        ipcRenderer.on("toggle-side-bar", () => {
            this.toggleOpenSideBar();
        });
        ipcRenderer.on("next-audio-track", (e, isNext: boolean) => {
            this.mpvService.nextAudioTrack(isNext);
        });
        ipcRenderer.on("toggle-loop", () => {
            this._ngZone.run(() => this.subtitlesService.toggleLoop());
        });
        ipcRenderer.on("extend-loop-prev", () => {
            this._ngZone.run(() => this.subtitlesService.extendLoop(-1));
        });
        ipcRenderer.on("extend-loop-next", () => {
            this._ngZone.run(() => this.subtitlesService.extendLoop(1));
        });
        ipcRenderer.on("shrink-loop-prev", () => {
            this._ngZone.run(() => this.subtitlesService.shrinkLoop(1));
        });
        ipcRenderer.on("shrink-loop-next", () => {
            this._ngZone.run(() => this.subtitlesService.shrinkLoop(-1));
        });
        ipcRenderer.on("window-closed", () => {
            this.closeFile();
        });
    }
    ngOnInit() {
        this.injectExtention();
    }

    injectExtention() {
        let localStorage = {
            set: obj => {
                this.storeService.set.extensionData(obj);
            },
            get: () => {
                return this.storeService.get.extensionData();
            }
        };
        messageListener(localStorage);
        window.addEventListener("message", e => {
            const msg = e.data;
            if (msg.type === "openPopup") {
                this.sideBarComponent.open = "tutor";
            }
        });
        allPages();
        tutor();
    }

    getCurrentAudioTrack() {
        return this.mpvService.state.trackList.filter(
            t => t.type === "audio" && t.selected
        )[0].id;
    }

    getSubtitlesFromStoreOrMatroskaFile(file) {
        this.subtitlesService
            .tryGetSubtitlesFromMkvFile(file)
            .then(subtitles => {
                this.storeService.set.subtitles(file, subtitles);
            })
            .catch(e => e);
    }

    closeFile(e?) {
        e && e.target.blur();
        const mpvState = this.mpvService.state;
        if (mpvState.duration !== 0) {
            this.storeService.set.timePos(mpvState.path, mpvState["time-pos"]);
            this.storeService.set.audioTrackId(
                mpvState.path,
                this.getCurrentAudioTrack()
            );
            this.storeService.set.subtitlesId(
                mpvState.path,
                this.subtitlesService.currentSubtitleLanguageNumber
            );
        }
        this.mpvService.stop();
    }

    openFile(existFile = undefined) {
        let _openFile = file => {
            this.closeFile();
            this.mpvService.loadFile(file);
            this.toggleOpenSideBar(true);

            if (this.storeService.isExist(file)) {
                const savePos = this.storeService.get.timePos(file);
                const audioTrack = this.storeService.get.audioTrackId(file);
                const subtitles = this.storeService.get.subtitles(file);
                const subtitlesId = this.storeService.get.subtitlesId(file);
                const timeInterval = 100;
                const there = this;
                setTimeout(function tick() {
                    if (there.mpvService.state.duration !== 0) {
                        savePos && there.mpvService.setTimePos(savePos);
                        audioTrack &&
                            there.mpvService.setAudioTrack(audioTrack);
                        if (subtitles) {
                            there.subtitlesService.subtitles = subtitles;
                            there.subtitlesService.currentSubtitleLanguageNumber = subtitlesId
                                ? subtitlesId
                                : subtitles[0].number;
                        } else {
                            there.getSubtitlesFromStoreOrMatroskaFile(file);
                        }
                    } else {
                        setTimeout(tick, timeInterval);
                    }
                }, timeInterval);
            } else {
                this.getSubtitlesFromStoreOrMatroskaFile(file);
            }
        };
        if (existFile) {
            _openFile(existFile);
        } else {
            let win = remote.getCurrentWindow();
            let items: string[] = remote.dialog.showOpenDialog(win, {
                filters: [
                    {
                        name: "Videos",
                        extensions: videoExtensions
                    },
                    {
                        name: "All files",
                        extensions: ["*"]
                    }
                ]
            });
            if (items) {
                _openFile(items[0]);
            }
        }
    }
    toggleOpenSideBar(state: boolean = undefined) {
        switch (state) {
            case undefined:
                if (this.sideBarComponent.open === "") {
                    this.sideBarComponent.open = "videoService";
                } else {
                    this.sideBarComponent.open = "";
                }
                break;
            case true:
                this.sideBarComponent.open = "videoService";
                break;
            case false:
                this.sideBarComponent.open = "";
                break;
        }
    }

    onChangeTheme(theme?: string) {
        if(!theme){
            theme = this.themeName === 'dark' ? 'light' : 'dark'
        }
		if (theme === 'dark') {
			this.themeService.addBodyClass('dark-theme');
			this.themeName = 'dark';
		}else if (theme === 'light')  {
			this.themeService.removeBodyClass('dark-theme');
			this.themeName = 'light';
		} 
		this.storeService.store.set('theme', this.themeName);
	}
    contextMenuEvent(e, text) {
        e.preventDefault();
        e.stopPropagation();
        ipcRenderer.send("openPopup", text);
    }
}
