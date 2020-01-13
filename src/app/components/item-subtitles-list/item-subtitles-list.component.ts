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

    private isAlreadyScroll: boolean = false;
    constructor(
        private mpvService: MpvService,
        private subtitlesService: SubtitlesService,
        public elRef: ElementRef
    ) {}

    ngOnInit() {}

    ngDoCheck() {
        if (this.subtitle.isCurrent && !this.isAlreadyScroll) {
            // this.scrollToSubtitle(this.index);
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
						this.subtitlesService.setSubtitleByKey(this.index)
            const startTime = this.subtitle.time + this.shift;
            if (this.mpvService.state.pause) {
							const nextSub = this.subtitlesService.getCurrentSubtitles().subtitle[this.index+1]
							let nextSubTime;
							if (nextSub){
								nextSubTime = nextSub.time
							}else{
								nextSubTime = this.mpvService.state.duration;
							}
                this.mpvService.playSomeTime(startTime-this.subtitle.startShift, nextSubTime - this.subtitle.time + this.subtitle.startShift);
            }
        }
    }

    clickCheckbox(e, id) {
        e.stopPropagation();
        this.clickChecked(id);
    }
}
