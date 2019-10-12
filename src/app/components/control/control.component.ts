import {
    Component,
    OnInit,
    Input,
    ElementRef,
    HostListener,
    ViewChild
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";

@Component({
    selector: "app-control",
    templateUrl: "./control.component.html",
    styleUrls: ["./control.component.scss"]
})
export class ControlComponent implements OnInit {
    @Input() openFile;
    @ViewChild("settings", null) settingsEl: ElementRef;
    @HostListener("document:mousedown", ["$event"]) downEv(e) {
        if (
            this.showSettings &&
            e.path.every(e => e !== this.settingsEl.nativeElement)
        ) {
            this.showSettings = false;
        }
    }
    @HostListener("document:mouseup", ["$event"]) upEv(e) {
        if (this.isHandleDownOnSeek) {
            document.removeEventListener("mousemove", this.changeSeekValue);
            this.isHandleDownOnSeek = false;
            if (this.isPreventPlay){
                this.isPreventPlay = false;
                this.mpvService.setPause(false)
            }
        }
    }
    @HostListener("document:mousemove", ["$event"]) moveEv(e) {
        if (this.isMouseOnSeek || this.isHandleDownOnSeek) {
            this.popupTime.x = e.x;
            const timeS = this.calcRangeValueFromPx();
            if (timeS === this.seek.min ){
                this.popupTime.x = this.seek.left;
            }else if (timeS === this.seek.max){
                this.popupTime.x = this.seek.left + this.seek.width;
            }
            this.popupTime.time = timeS;
        }
        if(this.isHandleDownOnSeek && !this.mpvService.state.pause && !this.isPreventPlay){
            this.isPreventPlay = true;
            this.mpvService.setPause(true)
        }
    }

    popupTime = {
        time: 0,
        x: 0,
        y: 0,
    };
    seek = {
        width: 0,
        max: 0,
        min: 0,
        left: 0        
    }
    isHandleDownOnSeek = false;
    isMouseOnSeek = false;
    isPreventPlay = false;
    showSettings = false;
    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public sanitizer: DomSanitizer
    ) {}

    changeSeekValue = e => {
        this.mpvService.setTimePos(this.popupTime.time);
    };
    handleSeekMouseDown(e) {
        e.preventDefault();
        this.mpvService.setTimePos(this.popupTime.time);
        this.isHandleDownOnSeek = true;
        document.addEventListener("mousemove", this.changeSeekValue);
        // this.mpvService.seeking = true;
    }
    mouseEnterSeek(e) {
        this.popupTime.y = e.target.offsetTop;
        this.seek.width = e.target.clientWidth;
        this.seek.min = e.target.min;
        this.seek.max = e.target.max;
        this.seek.left = e.target.getBoundingClientRect().left;
        this.isMouseOnSeek = true;
    }
    mouseLeaveSeek() {
        this.isMouseOnSeek = false;
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
        if (!this.mpvService.state.duration) {
            return "var(--text)";
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
    secondToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor((d % 3600) / 60);
        var s = Math.floor((d % 3600) % 60);
        return (
            (h ? ("0" + h).slice(-2) + ":" : "") +
            ("0" + m).slice(-2) +
            ":" +
            ("0" + s).slice(-2)
        );
    }
    calcRangeValueFromPx() {
        const curPx = this.popupTime.x - this.seek.left;
        const width = this.seek.width;
        const maxValue = this.seek.max;
        const minValue = this.seek.min;
        const range = (curPx / width) * (maxValue - minValue);
        if(range <= minValue){
            return minValue;
        }else if (range > maxValue){
            return maxValue;
        }else{
            return range;
        }
    }

    toggleShowSittings(e) {
        e.target.blur();
        this.showSettings = !this.showSettings;
    }
}
