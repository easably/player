import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Input,
    ViewChild,
    ElementRef,
    SimpleChanges
} from "@angular/core";
import { SubtitlesService } from "../../services/subtitles.service";
import { MpvService } from "../../services/mpv.service";
import Subtitle from "../../interfaces/subtitle";
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

@Component({
    selector: "app-subtitles-list",
    templateUrl: "./subtitles-list.component.html",
    styleUrls: ["./subtitles-list.component.scss"]
})
export class SubtitlesListComponent implements OnInit {
    @ViewChild("list", undefined) list: ElementRef;
    @Input() filterText: string;
    @Input() contextMenuEvent;
    @Input() subtitles: Subtitle[];
    @Input() subtitleShift;
    @ViewChild(VirtualScrollerComponent, null) private virtualScroller: VirtualScrollerComponent;
    public currentBetweenSubtitlesComponent = {
        index: undefined,
        component: undefined
    };
    public checkedList: number[] = [];
    private subscribeLoader;
    public curSubtitles: any;
    constructor(
        public subtitlesService: SubtitlesService,
        private changeDetectorRef: ChangeDetectorRef,
        private mpvService: MpvService
    ) {}
    ngOnChanges(changes: SimpleChanges) {
        this.curSubtitles = this.getSubtitleList();
    }
    ngOnInit() {
        this.subscribeLoader = this.subtitlesService.subtitleLoaded.subscribe(
            () => {
                this.changeDetectorRef.detectChanges();
            }
        );
    }
    ngOnDestroy() {
        this.subscribeLoader.unsubscribe();
    }

    scrollToSubtitle(index){
        this.virtualScroller.scrollToIndex(index,true, - this.list.nativeElement.offsetHeight / 2);
    }

    getSubtitleList() {
        let subtitles = this.subtitles;
        if (!subtitles) return false;
        if (this.filterText != "")
            subtitles = subtitles.filter(
                s =>
                    s.text
                        .toUpperCase()
                        .indexOf(this.filterText.toUpperCase()) !== -1
            );
        return subtitles.map((s, i) => {
            return { index: i, subtitle: s };
        });
    }
    checkChecked(id) {
        return this.checkedList.some(e => e === id);
    }
    clickChecked(id) {
        const checkedList = this.checkedList;
        if (!checkedList.some(e => e == id)) {
            checkedList.push(id);
            if (checkedList.length === 1) {
                this.mpvService.setPause(true);
            }
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
    _getStartAndDurationChecked() {
        const start = this.subtitlesService.getCurrentSubtitles().subtitle[
            this.checkedList[0]
        ].time;
        const lastSub = this.subtitlesService.getCurrentSubtitles().subtitle[
            this.checkedList[this.checkedList.length - 1]
        ];
        const dur = lastSub.time + lastSub.duration - start;
        return { start: start, dur: dur };
    }
    playChecked() {
        let { start, dur } = this._getStartAndDurationChecked();
        this.mpvService.playSomeTime(start, dur);
    }
    loopChecked() {
        this.subtitlesService.clearLoop();
        this.subtitlesService.addLoopRangeSubtitle(
            this.checkedList[this.checkedList.length - 1],
            this.checkedList[0]
        );
    }
    playbackSpeedChecked(speed) {
        let { start, dur } = this._getStartAndDurationChecked();
        this.mpvService.playSomeTimeWithPlaybackSpeed(start, dur, speed);
    }
}
