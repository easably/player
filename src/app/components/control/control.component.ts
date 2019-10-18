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
    @ViewChild("timeRange", null) timeRangeEl: ElementRef;
    @ViewChild("popupTimeEl", null) popupTimeEl: ElementRef;
    @ViewChild("volumeRange", null) volumeRangeEl: ElementRef;
    @HostListener("document:mousedown", ["$event"]) downEv(e) {
        if (
            this.showSettings &&
            e.path.every(e => e !== this.settingsEl.nativeElement)
        ) {
            this.showSettings = false;
        }
    }
    @HostListener("document:mouseup", ["$event"]) upEv(e) {
        if (this.isHandleDownOnRange) {
            document.removeEventListener("mousemove", this.changeRangeValue);
            this.isHandleDownOnRange = false;
            if (this.isPreventPlay) {
                this.isPreventPlay = false;
                this.mpvService.setPause(false);
            }
        }
    }
    @HostListener("document:mousemove", ["$event"]) moveEv(e) {
        if (this.isMouseOnRange || this.isHandleDownOnRange) {
            this.popupTime.x = e.x;
            const timeS = this.calcRangeValueFromPx();
            if (timeS === this.range.min) {
                this.popupTime.x = this.range.left;
            } else if (timeS === this.range.max) {
                this.popupTime.x = this.range.left + this.range.width;
            }

            let offsetLeft = this.popupTime.x - this.popupTimeEl.nativeElement.clientWidth/2;
            let offsetRight = this.popupTime.x + this.popupTimeEl.nativeElement.clientWidth/2;
            const windowWidth = document.documentElement.clientWidth;
            if (offsetLeft < 0){
                this.popupTime.x += -offsetLeft;
                this.popupTime.arrowOffset = offsetLeft;
            }else if(offsetRight > windowWidth){
                this.popupTime.x -=  offsetRight - windowWidth ;
                this.popupTime.arrowOffset = offsetRight - windowWidth;
            }else{
                this.popupTime.arrowOffset = 0;
            }

            this.popupTime.time = timeS;
        }
        if (
            this.isHandleDownOnRange &&
            !this.mpvService.state.pause &&
            !this.isPreventPlay
        ) {
            this.isPreventPlay = true;
            this.mpvService.setPause(true);
        }
    }

    popupTime = {
        time: 0,
        x: 0,
        y: 0,
        arrowOffset: 0
    };
    range = {
        width: 0,
        max: 0,
        min: 0,
        left: 0
    };
    isHandleDownOnRange = false;
    isMouseOnRange = false;
    isPreventPlay = false;

    showSettings = false;

    showVolume = false;
    constructor(
        public mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public sanitizer: DomSanitizer
    ) {}

    changeRangeValue = e => {
        this.mpvService.setTimePos(this.popupTime.time);
    };
    handleRangeMouseDown(e) {
        e.preventDefault();
        this.mpvService.setTimePos(this.popupTime.time);
        this.isHandleDownOnRange = true;
        document.addEventListener("mousemove", this.changeRangeValue);
        // this.mpvService.seeking = true;
    }
    mouseEnterRange(e) {
        this.popupTime.y = e.target.offsetTop;
        this.range.width = e.target.clientWidth;
        this.range.min = e.target.min;
        this.range.max = e.target.max;
        this.range.left = e.target.getBoundingClientRect().left;
        this.isMouseOnRange = true;
    }
    mouseLeaveRange() {
        this.isMouseOnRange = false;
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
    getGradientForRange(range) {
        if (range.max == 0) {
            return "var(--text)";
        }
        let curPercent = (range.value / range.max - range.min) * 100;
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
        const curPx = this.popupTime.x - this.range.left;
        const width = this.range.width;
        const maxValue = this.range.max;
        const minValue = this.range.min;
        const range = (curPx / width) * (maxValue - minValue);
        if (range <= minValue) {
            return minValue;
        } else if (range > maxValue) {
            return maxValue;
        } else {
            return range;
        }
    }

    toggleShowSittings(e) {
        e.target.blur();
        this.showSettings = !this.showSettings;
    }

    mouseEnterVolume() {
        this.showVolume = true;
    }

    mouseLeaveVolume() {
        this.showVolume = false;
    }

    toggleMute() {
        if (this.mpvService.state.volume === 0) {
            this.mpvService.setVolume(50);
            this.mpvService.toggleMute(false);
        } else {
            this.mpvService.toggleMute();
        }
    }

    handleInputVolume(e) {
        if (this.mpvService.state.mute) this.mpvService.toggleMute(false);
        this.mpvService.setVolume(e.target.value);
    }
    
    handleClickVolume(e){
        e.target.blur();
    }

    getIconPathForControlVolume() {
        let typeVolume;
        const volume = this.mpvService.state.volume;
        const mute = this.mpvService.state.mute;
        if (mute || volume <= 0) {
            typeVolume = "volume-mute";
        } else if (volume > 50) {
            typeVolume = "volume-max";
        } else if (volume > 0) {
            typeVolume = "volume-min";
        }
        return "assets/images/" + typeVolume + ".svg";
    }
}
