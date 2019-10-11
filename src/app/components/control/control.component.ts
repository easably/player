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
    popupTime = {
        time: 0,
        show: false,
        x: 0,
        y:0
    }
    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public sanitizer: DomSanitizer
    ) {}

    handleSeekMouseUp(e) {
        this.mpvService.seeking = false;
        e.target.value = this.popupTime.time;
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
    secondToHms(d){
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return (h ? (('0' + h).slice(-2) + ":") : '') + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2)
    }
    handleMouseMove(e){
        this.popupTime.x = e.x;
        this.popupTime.y = e.target.offsetTop;
        const timeS = this.calcRangeValueFromPx(e.offsetX, e.target.clientWidth, e.target.max, e.target.min);
        this.popupTime.time = timeS;
    }
    calcRangeValueFromPx(curPx, width, maxValue, minValue=0){
        return curPx/width * (maxValue-minValue);
    }
}
