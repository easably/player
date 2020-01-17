import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  HostListener
} from "@angular/core";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";
import { ipcRenderer, remote } from "electron";
import { videoExtensions } from "../../../static/config.js";
import { SideBarComponent } from "../side-bar/side-bar.component";
import { allPages, messageListener, tutor } from "easylang-extension";
import { StoreService } from "../../services/store.service";
import { ThemeService } from "../../services/theme.service";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"]
})
export class PlayerComponent implements OnInit {
  @ViewChild(SideBarComponent, undefined) sideBarComponent: SideBarComponent;
  @HostListener("document:keydown", ["$event"]) handleKeyEvent(e) {
    if (e.keyCode === 27 && this.mpvService.state.fullscreen) {
      this.mpvService.toggleFullscreen();
    } else if (e.keyCode === 38) {
      this.subtitlesService.setSubtitlePrev();
    } else if (e.keyCode === 40) {
      this.subtitlesService.setSubtitleNext();
    } else if (e.keyCode === 32 && e.target === document.body) {
      e.preventDefault();
      this.mpvService.togglePause();
    } else if (e.keyCode === 82) {
      this.subtitlesService.setSubtitleRepeat();
    }
  }
  @HostListener("window:beforeunload", ["$event"]) beforeUnload(e) {
    this.closeFile();
    this.closeWindow();
  }
	public themeName: string;
	public isOpenSettings: boolean = false;
  public recentFiles = this.storeService.get.custom("recentFiles") || [];
  constructor(
    public mpvService: MpvService,
    private subtitlesService: SubtitlesService,
    private _ngZone: NgZone,
    private storeService: StoreService,
		private themeService: ThemeService
  ) {
    this.onChangeTheme(storeService.store.get("theme") || "dark");
    this.mpvService.mpvReadyHook = () => {
      ipcRenderer.send("appReady");
      this.mpvService.setVolume(this.storeService.get.custom("volume"));
      this.mpvService.toggleMute(this.storeService.get.custom("mute"));
      this.mpvService.changeSpeed(this.storeService.get.custom("speed"));
      const showOnVideo = this.storeService.get.custom("showSubtitlesOnVideo");
      if (showOnVideo !== undefined) {
        this.subtitlesService.showOnVideo = showOnVideo;
      }
    };
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
      if (this.mpvService.state.duration) this.subtitlesService.loadSubtitles();
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
    ipcRenderer.on("clearRecentDocuments", () => {
			this.recentFiles = [];
      this.storeService.set.custom("recentFiles", this.recentFiles);
      this.storeService.clear();
      remote.app.clearRecentDocuments();
    });
    ipcRenderer.on("open-settings", () => {
			this._ngZone.run(() => this.toggleOpenSettings());
    });
  }
  ngOnInit() {
    this.injectExtension();
  }

  injectExtension() {
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
    // allPages();
    tutor();
  }

  getCurrentAudioTrack() {
    let track = this.mpvService.state.trackList.filter(
      t => t.type === "audio" && t.selected
    )[0];
    return track && track.id;
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
      this.storeService.set.subtitlesId2(
        mpvState.path,
        this.subtitlesService.secondSubtitleLanguageNumber
      );
      this.addRecentFile(mpvState.path, mpvState.filename);
      this.storeService.set.custom("recentFiles", this.recentFiles);
      ipcRenderer.send("addRecentFile", mpvState.path);
    }
    this.mpvService.stop();
  }

  closeWindow() {
    this.storeService.set.custom("theme", this.themeName);
    this.storeService.set.custom("volume", this.mpvService.state.volume);
    this.storeService.set.custom("mute", this.mpvService.state.mute);
    this.storeService.set.custom("speed", this.mpvService.state.speed);
    this.storeService.set.custom(
      "showSubtitlesOnVideo",
      this.subtitlesService.showOnVideo
    );
  }

  addRecentFile(path: string, name: string) {
    let recentFiles = [...this.recentFiles];
    recentFiles.forEach((f, i) => {
      if (f.path === path) {
        recentFiles.splice(i, 1);
      }
    });
    recentFiles.unshift({ path, name });
    if (recentFiles.length > 5) {
      recentFiles.pop();
    }
    this.recentFiles = recentFiles;
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
        const subtitlesId2 = this.storeService.get.subtitlesId2(file);
        const timeInterval = 100;
        const there = this;
        setTimeout(function tick() {
          if (there.mpvService.state.duration !== 0) {
            savePos && there.mpvService.setTimePos(savePos);
            audioTrack && there.mpvService.setAudioTrack(audioTrack);
            if (subtitles) {
              there.subtitlesService.subtitles = subtitles;
              there.subtitlesService.currentSubtitleLanguageNumber = subtitlesId
                ? subtitlesId
                : subtitles[0].number;
              there.subtitlesService.secondSubtitleLanguageNumber = subtitlesId2
                ? subtitlesId2
                : subtitles[subtitles.length > 0 ? 1 : 0].number;
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
    if (!theme) {
      theme = this.themeName === "dark" ? "light" : "dark";
    }
    if (theme === "dark") {
      this.themeService.addBodyClass("dark-theme");
      this.themeName = "dark";
    } else if (theme === "light") {
      this.themeService.removeBodyClass("dark-theme");
      this.themeName = "light";
    }
  }

  contextMenuEvent(e, text) {
    e.preventDefault();
    e.stopPropagation();
    ipcRenderer.send("openPopup", text);
	}
	
	closeSettings(){
		this.isOpenSettings = false;
	}

	toggleOpenSettings(){
		this.isOpenSettings = !this.isOpenSettings;
	}
}
