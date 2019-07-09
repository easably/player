import { Component, OnInit } from '@angular/core';
import { SubtitlesService} from '../../services/subtitles.service'

@Component({
  selector: 'app-video-subtitle',
  templateUrl: './video-subtitle.component.html',
  styleUrls: ['./video-subtitle.component.scss']
})
export class VideoSubtitleComponent implements OnInit {
  public currentSubtitle = '';
  constructor(private subtitlesService: SubtitlesService) { }

  ngOnInit() {
    
  }
  ngDoCheck(){
    // console.log(this.mpvService.state['time-pos'])
    if (this.subtitlesService.subtitles && this.subtitlesService.getCurrentSubtitles().subtitle){
      let subtitle = this.subtitlesService.getCurrentSubtitles().subtitle.filter(t=>t.isCurrent)[0];
      this.currentSubtitle = subtitle ? subtitle.text : '';
    }else{
      this.currentSubtitle = '';
    }
  }

}
