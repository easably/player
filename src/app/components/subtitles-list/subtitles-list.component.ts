import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Input,
    ViewChild,
    ElementRef
} from "@angular/core";
import { SubtitlesService } from "../../services/subtitles.service";
import { MpvService } from "../../services/mpv.service";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import Subtitle from "../../interfaces/subtitle";

@Component({
    selector: "app-subtitles-list",
    templateUrl: "./subtitles-list.component.html",
    styleUrls: ["./subtitles-list.component.scss"]
})
export class SubtitlesListComponent implements OnInit {
    @ViewChild("list", undefined) list: ElementRef;
    @Input() filterText: string;
    @Input() contextMenuEvent;
    // @ViewChild(CdkVirtualScrollViewport, {
    //   static: false
    // }) viewPort: CdkVirtualScrollViewport;
    public currentBetweenSubtitlesComponent: {
        index: number;
        component: Subtitle;
    };
    public checkedList: number[];
    private subscribeLoader;
    constructor(
        public subtitlesService: SubtitlesService,
        private changeDetectedRef: ChangeDetectorRef,
        private mpvService: MpvService
    ) {
        this.checkedList = [];
        this.currentBetweenSubtitlesComponent = {
            index: undefined,
            component: undefined
        };
    }

    ngOnInit() {
        this.subscribeLoader = this.subtitlesService.subtitleLoaded.subscribe(
            () => {
                this.changeDetectedRef.detectChanges();
            }
        );
    }
    ngOnDestroy() {
        this.subscribeLoader.unsubscribe();
    }

    getSubtitleList() {
        if (!this.subtitlesService.getCurrentSubtitles()) return [];
        const subtitles: Subtitle[] = this.subtitlesService.getCurrentSubtitles()
            .subtitle;
        if (!subtitles) return [];
        if (this.filterText != "")
            return subtitles.filter(
                s =>
                    s.text
                        .toUpperCase()
                        .indexOf(this.filterText.toUpperCase()) !== -1
            );
        return subtitles;
    }
    checkChecked(id) {
        return this.checkedList.some(e => e === id);
    }
    clickChecked(id) {
        const checkedList = this.checkedList;
        if (!checkedList.some(e => e == id)) {
            checkedList.push(id);
            let min = Math.min(...checkedList);
            let max = Math.max(...checkedList);
            let newCheckedList = [];
            for (let i = min; i <= max; i++) {
                newCheckedList.push(i);
            }
            this.checkedList = newCheckedList;
        } else {
            if (id >= checkedList[Math.floor(checkedList.length / 2)]) {
                this.checkedList = checkedList.filter(e => e < id);
            } else {
                this.checkedList = checkedList.filter(e => e > id);
            }
        }
    }
    _getStartAndDurationChecked(){
        const start = this.subtitlesService.getCurrentSubtitles().subtitle[
            this.checkedList[0]
        ].time;
        const lastSub = this.subtitlesService.getCurrentSubtitles().subtitle[
            this.checkedList[this.checkedList.length - 1]
        ];
        const dur = lastSub.time + lastSub.duration - start;
        return {start: start, dur: dur}
    }
    playChecked() {
        let {start,dur} = this._getStartAndDurationChecked()
        this.mpvService.playSomeTime(start, dur);
        this.checkedList = [];
    }
    loopChecked() {
        this.subtitlesService.clearLoop();
        this.subtitlesService.addLoopRangeSubtitle(
            this.checkedList[this.checkedList.length - 1],
            this.checkedList[0]
        );
        this.checkedList = [];
    }
    playbackSpeedChecked(speed){
        let {start,dur} = this._getStartAndDurationChecked()
        this.mpvService.playSomeTimeWithPlaybackSpeed(start,dur,speed)
        this.checkedList = [];
    }
}
