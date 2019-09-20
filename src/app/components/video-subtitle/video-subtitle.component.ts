import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SubtitlesService} from '../../services/subtitles.service'
import Subtitle from '../../interfaces/subtitle'

@Component({
  selector: 'app-video-subtitle',
  templateUrl: './video-subtitle.component.html',
  styleUrls: ['./video-subtitle.component.scss']
})
export class VideoSubtitleComponent implements OnInit {
  @ViewChild('subtitleDOM',undefined) subtitleDOM :ElementRef;
  @Input() contextMenuEvent;
  public currentSubtitle:string = '';
  constructor(private subtitlesService: SubtitlesService) { }

  ngOnInit() {
    
  }
  updateCurrentSubtitle(){
    if (this.subtitlesService.subtitles && this.subtitlesService.getCurrentSubtitles().subtitle){
      let subtitle: Subtitle = this.subtitlesService.getCurrentSubtitles().subtitle.filter(t=>t.isCurrent)[0];
      this.currentSubtitle = subtitle ? subtitle.text : '';
    }else{
      this.currentSubtitle = '';
    }
  }
  ngDoCheck(){
    this.updateCurrentSubtitle()
  }

}
