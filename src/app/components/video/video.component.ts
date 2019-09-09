import { Component, OnInit, ElementRef, Input} from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() contextMenuEvent;
  private embed;
  public embedProps;
  
  constructor(public mpvService: MpvService, private subtitlesService: SubtitlesService, public elRef: ElementRef){
    this.embedProps = this.mpvService.mpv.getDefProps();
  }
  ngOnInit(){
    this.embed = this.elRef.nativeElement.querySelector('embed');
    this.mpvService.mpv.setPluginNode(this.embed);
  }
  ngDoCheck(){
    this.subtitlesService.findCurrentSubtitle();
    const loopTime = this.subtitlesService.getLoopTime();
    if (loopTime && this.mpvService.state['time-pos'] > loopTime.end){
      this.mpvService.setTimePos(loopTime.start)
    }
  }
}
