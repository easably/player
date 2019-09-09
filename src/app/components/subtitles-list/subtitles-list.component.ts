import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewChild,
  ChangeDetectionStrategy
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

@Component({
  selector: 'app-subtitles-list',
  templateUrl: './subtitles-list.component.html',
  styleUrls: ['./subtitles-list.component.scss']
})
export class SubtitlesListComponent implements OnInit {
  @Input() filterText;
  @Input() contextMenuEvent;
  @ViewChild(CdkVirtualScrollViewport, {
    static: false
  }) viewPort: CdkVirtualScrollViewport;
  public currentBetweenSubtitlesComponent = {
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
  generateBetweenSubtitlesComponent(subtitle) {
    
    const curSubtitle = subtitle;
    const index = this.subtitlesService.getCurrentSubtitles().subtitle.findIndex(e => e.time === subtitle.time);
    if (this.currentBetweenSubtitlesComponent.index === index) {
      return this.currentBetweenSubtitlesComponent.component;
    }
    let nextSubtitle = this.subtitlesService.getCurrentSubtitles().subtitle[index + 1];
    if (!nextSubtitle) {
      nextSubtitle = {
        time: this.mpvService.state.duration
      }
    }
    if (!curSubtitle || !nextSubtitle) {
      this.currentBetweenSubtitlesComponent = {
      index: undefined,
      component: undefined
    }
      return
    }
    const time = curSubtitle.time + curSubtitle.duration;
    const duration = nextSubtitle.time - time;
    const curTime = this.mpvService.state['time-pos']
    const isCurrent = curTime >= time && curTime < time + duration;
    if (!isCurrent) {
      this.currentBetweenSubtitlesComponent = {
      index: undefined,
      component: undefined
    }
      return;
    }
    const component = {
      text: '',
      time: time,
      duration: duration,
      isCurrent: isCurrent
    }

    this.currentBetweenSubtitlesComponent = {
      index: index,
      component: component
    }

    return component
  }
  getSubtitleList() {
    const subtitles = this.subtitlesService.getCurrentSubtitles().subtitle;
    if (!subtitles) return [];
    if (this.filterText != '') return subtitles.filter(s => s.text.toUpperCase().indexOf(this.filterText.toUpperCase()) !== -1);
    return subtitles;
  }
  ngDoCheck() {
    // this.changeDetectedRef.detectChanges();

  }
}