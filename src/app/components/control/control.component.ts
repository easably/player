import { Component, OnInit, Input, Sanitizer } from "@angular/core";
import {DomSanitizer} from '@angular/platform-browser'
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";

@Component({
    selector: "app-control",
    templateUrl: "./control.component.html",
    styleUrls: ["./control.component.scss"]
})
export class ControlComponent implements OnInit {
    @Input() openFile;
    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public sanitizer: DomSanitizer
    ) {}

    handleSeekMouseUp() {
        this.mpvService.seeking = false;
    }
    handleSeekMouseDown() {
        this.mpvService.seeking = true;
    }
    handleSeek(e) {
        e.target.blur();
        const timePos: number = +e.target.value;
        this.mpvService.setTimePos(timePos);
    }
    handleFullscreen(e) {
        e.target.blur();
        this.mpvService.toggleFullscreen();
    }
    togglePause(e) {
        e.target.blur();
        this.mpvService.togglePause();
    }
    ngOnInit() {}
    getGradientForRange() {
        if(!this.mpvService.state.duration){
            return 'var(--text)'
        }
        let curPercent =
            (this.mpvService.state["time-pos"] /
                this.mpvService.state.duration) *
            100;
        return (
            "linear-gradient(to right,var(--main) 0%, var(--main) " +
            curPercent +
            "%,var(--text) " +
            curPercent +
            "%, var(--text) 100%"
        );
    }
}
