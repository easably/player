import {
    Component,
    OnInit,
    Input,
    ElementRef,
    SimpleChanges
} from "@angular/core";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";
import Subtitle from "../../interfaces/subtitle";

@Component({
    selector: "app-item-subtitles-list",
    templateUrl: "./item-subtitles-list.component.html",
    styleUrls: ["./item-subtitles-list.component.scss"]
})
export class ItemSubtitlesListComponent implements OnInit {
    @Input() subtitle: Subtitle;
    @Input() shift: number;
    @Input() contextMenuEvent;
    @Input() index: number;
    @Input() checked: boolean;
    @Input() clickChecked: any;
    @Input() scrollToSubtitle: any;

    private isAlreadyScroll: boolean = false;
    constructor(
        private mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public elRef: ElementRef
    ) {}

    ngOnInit() {}

    checkBetweenLineAfterComponent() {
        let nextSubtitle: Subtitle = this.subtitlesService.getCurrentSubtitles()
            .subtitle[this.index + 1];
        if (!nextSubtitle) {
            nextSubtitle = {
                time: this.mpvService.state.duration,
                duration: 0,
                text: "",
                isCurrent: false,
                isLoop: false
            };
        }
        const time: number = this.subtitle.time + this.subtitle.duration;
        const duration: number = nextSubtitle.time - time;
        const curTime: number = this.mpvService.state["time-pos"];
        const isCurrent: boolean = curTime >= time && curTime < time + duration;
        if (isCurrent) {
            return true;
        }
        return false;
    }

    ngDoCheck() {
        if (this.subtitle.isCurrent && !this.isAlreadyScroll) {
            this.scrollToSubtitle(this.index);
            this.isAlreadyScroll = true;
        } else if (!this.subtitle.isCurrent && this.isAlreadyScroll) {
            this.isAlreadyScroll = false;
        }
    }

    clickEvent(e) {
        if (e.shiftKey) {
            document.getSelection().removeAllRanges();
            this.subtitlesService.addLoopRangeSubtitle(this.index);
        } else {
            !this.subtitle.isLoop && this.subtitlesService.clearLoop();
            const startTime = this.subtitle.time + this.shift;
            this.mpvService.setTimePos(startTime);
            if (this.mpvService.state.pause) {
                this.mpvService.playSomeTime(startTime, this.subtitle.duration);
            }
        }
    }

    clickCheckbox(e, id) {
        e.stopPropagation();
        this.clickChecked(id);
    }
}
