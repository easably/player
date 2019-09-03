import { Component, OnInit, ChangeDetectorRef, Input} from '@angular/core';
import { SubtitlesService } from '../../services/subtitles.service';
import { MpvService } from '../../services/mpv.service';

@Component({
  selector: 'app-subtitles-list',
  templateUrl: './subtitles-list.component.html',
  styleUrls: ['./subtitles-list.component.scss']
})
export class SubtitlesListComponent implements OnInit {
  @Input() filterText;
  @Input() contextMenuEvent;
  constructor( public subtitlesService: SubtitlesService, private mpvService: MpvService, private changeDetectedRef: ChangeDetectorRef) { 

  }
  
  ngOnInit() { 
    this.subtitlesService.subtitleLoaded.subscribe(()=>{
      this.changeDetectedRef.detectChanges();
    });

  }
  generateBetweenSubtitlesComponent(indexPastSubtitle){
    const curSubtitle = this.subtitlesService.getCurrentSubtitles().subtitle[indexPastSubtitle];
    const nextSubtitle = this.subtitlesService.getCurrentSubtitles().subtitle[indexPastSubtitle+1];
    if(!curSubtitle || !nextSubtitle){
      return
    }
    const time = curSubtitle.time+curSubtitle.duration;
      const duration = nextSubtitle.time - time;
      const curTime =this.mpvService.state['time-pos']
    return {
      text: '',
      time: time,
      duration: duration,
      isCurrent:  curTime>= time && curTime< time+duration
    }
  }
  getSubtitleList(){
    const subtitles = this.subtitlesService.getCurrentSubtitles().subtitle;
    if (!subtitles) return [];
    if (this.filterText != '') return subtitles.filter(s=>s.text.toUpperCase().indexOf(this.filterText.toUpperCase()) !== -1);
    return subtitles;
  }
  ngDoCheck(){
    // this.changeDetectedRef.detectChanges();

  }
}
