import {
    Component,
    OnInit,
    ElementRef,
    Input,
    ViewChild,
    SimpleChanges
} from "@angular/core";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";
import Subtitle from "../../interfaces/subtitle";
import { VideoSubtitleComponent } from "../video-subtitle/video-subtitle.component";

import { video } from "easylang-extension";

@Component({
    selector: "app-video",
    templateUrl: "./video.component.html",
    styleUrls: ["./video.component.scss"]
})
export class VideoComponent implements OnInit {
    @ViewChild("embed", undefined) embed: ElementRef;
    @ViewChild(VideoSubtitleComponent, undefined) videoSubtitleComponent;
    @Input() contextMenuEvent;
    @Input() time;
    @Input() filename;
    public embedProps: any;
    private isHandleClick = false;
    private standartTitle = document.title;

    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService
    ) {
        this.embedProps = this.mpvService.mpv.getDefProps();
    }
    ngOnInit() {
        const element = this.embed.nativeElement;
        this.mpvService.mpv.setPluginNode(element);
    }
    ngAfterViewInit() {
        this.injectExtension();
    }
    injectExtension() {
        const playerParameters = {
            videoDOM: this.embed.nativeElement,
            subtitlesDOM: this.videoSubtitleComponent.subtitleDOM.nativeElement,
            pause: () => this.mpvService.setPause(true),
            play: () => this.mpvService.setPause(false),
            paused: () => this.mpvService.state.pause,
            playRepeat: this.subtitlesService.setSubtitleRepeat.bind(
                this.subtitlesService
            ),
            playPrev: this.subtitlesService.setSubtitlePrev.bind(
                this.subtitlesService
            ),
            playNext: this.subtitlesService.setSubtitleNext.bind(
                this.subtitlesService
            )
        };

        video(playerParameters);
    }
    loopBorderControl() {
        const loopSubtitles: Subtitle[] = this.subtitlesService.getLoopSubtitles();
        const curTime = this.mpvService.state["time-pos"];
        if (loopSubtitles && loopSubtitles.length > 0) {
            const [firstLoopSubtitle, lastLoopSubtitle] = [
                loopSubtitles[0],
                loopSubtitles[loopSubtitles.length - 1]
            ];
            if (curTime < firstLoopSubtitle.time) {
                this.mpvService.setTimePos(lastLoopSubtitle.time);
            } else if (
                curTime >=
                lastLoopSubtitle.time + lastLoopSubtitle.duration
            ) {
                this.mpvService.setTimePos(firstLoopSubtitle.time);
            }
        }
    }
    setDocumentTitle(filename) {
        document.title = filename;
    }
    ngDoCheck() {}
    ngOnChanges(changes: SimpleChanges) {
        if (changes.time) {
            this.subtitlesService.findCurrentSubtitle();
            this.loopBorderControl();
            if (
                changes.time.currentValue === 0 &&
                this.mpvService.state.duration === 0
            ) {
                this.setDocumentTitle(this.standartTitle);
            }
        } else if (changes.filename) {
            this.setDocumentTitle(changes.filename.currentValue);
        }
    }
    handleClick() {
        this.mpvService.togglePause();
        if (!this.isHandleClick) {
            this.isHandleClick = true;
            setTimeout(() => {
                this.isHandleClick = false;
            }, 500);
        } else {
            this.mpvService.togglePause();
            this.mpvService.toggleFullscreen();
        }
    }
}
