import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewChild
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
  @Input() filterText: string;
  @Input() contextMenuEvent;
  // @ViewChild(CdkVirtualScrollViewport, {
  //   static: false
  // }) viewPort: CdkVirtualScrollViewport;
  public currentBetweenSubtitlesComponent: {index:number,component: Subtitle} = {
    index: undefined,
    component: undefined
  };
  constructor(public subtitlesService: SubtitlesService, private mpvService: MpvService, private changeDetectedRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.subtitlesService.subtitleLoaded.subscribe(() => {
      this.changeDetectedRef.detectChanges();
    });
  }

  generateBetweenSubtitlesComponent() {
    if (!this.subtitlesService.currentSubtitleKey) return;
    const curSubtitle: Subtitle = this.subtitlesService.getCurrentSubtitle();
    if (!curSubtitle) return;
    const index: number = this.subtitlesService.getCurrentSubtitles().subtitle.findIndex(e => e.time === curSubtitle.time);
    if (this.currentBetweenSubtitlesComponent.index === index) {
      return;
    }
    let nextSubtitle: Subtitle = this.subtitlesService.getCurrentSubtitles().subtitle[index + 1];
    if (!nextSubtitle) {
      nextSubtitle = {
        time: this.mpvService.state.duration,
        duration: 0,
        text: '',
        isCurrent:false,
        isLoop:false
      }
    }
    if (!curSubtitle || !nextSubtitle) {
      this.currentBetweenSubtitlesComponent = {
        index: undefined,
        component: undefined
      }
      return;
    }
    const time:number = curSubtitle.time + curSubtitle.duration;
    const duration:number = nextSubtitle.time - time;
    const curTime:number = this.mpvService.state['time-pos']
    const isCurrent: boolean = curTime >= time && curTime < time + duration;
    if (!isCurrent) {
      this.currentBetweenSubtitlesComponent = {
        index: undefined,
        component: undefined
      }
      return;
    }
    const component: Subtitle = {
      text: '',
      time: time,
      duration: duration,
      isCurrent: isCurrent,
      isLoop: false
    }

    this.currentBetweenSubtitlesComponent = {
      index: index,
      component: component
    }
    return component
  }
  getSubtitleList() {
    if(!this.subtitlesService.getCurrentSubtitles()) return [];
    const subtitles: Subtitle[] = this.subtitlesService.getCurrentSubtitles().subtitle;
    if (!subtitles) return [];
    if (this.filterText != '') return subtitles.filter(s => s.text.toUpperCase().indexOf(this.filterText.toUpperCase()) !== -1);
    return subtitles;
  }
  ngDoCheck() {
    
    this.subtitlesService.subtitles && this.subtitlesService.subtitles.length !== 0 && this.generateBetweenSubtitlesComponent();

  }
}