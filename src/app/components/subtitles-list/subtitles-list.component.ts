import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  SubtitlesService
} from '../../services/subtitles.service';
import {
  MpvService
} from '../../services/mpv.service';
import {
  CdkVirtualScrollViewport
} from '@angular/cdk/scrolling';
import Subtitle from '../../interfaces/subtitle'

@Component({
  selector: 'app-subtitles-list',
  templateUrl: './subtitles-list.component.html',
  styleUrls: ['./subtitles-list.component.scss']
})
export class SubtitlesListComponent implements OnInit {
  @ViewChild('list', undefined) list: ElementRef;
  @Input() filterText: string;
  @Input() contextMenuEvent;
  // @ViewChild(CdkVirtualScrollViewport, {
  //   static: false
  // }) viewPort: CdkVirtualScrollViewport;
  public currentBetweenSubtitlesComponent: {
    index: number,
    component: Subtitle
  } = {
    index: undefined,
    component: undefined
  };
  private subscribeLoader;
  constructor(public subtitlesService: SubtitlesService, private mpvService: MpvService, private changeDetectedRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.subscribeLoader = this.subtitlesService.subtitleLoaded.subscribe(() => {
        this.changeDetectedRef.detectChanges();
    });
  }
  ngOnDestroy(){
    this.subscribeLoader.unsubscribe();

  }

  getSubtitleList() {
    if (!this.subtitlesService.getCurrentSubtitles()) return [];
    const subtitles: Subtitle[] = this.subtitlesService.getCurrentSubtitles().subtitle;
    if (!subtitles) return [];
    if (this.filterText != '') return subtitles.filter(s => s.text.toUpperCase().indexOf(this.filterText.toUpperCase()) !== -1);
    return subtitles;
  }
}