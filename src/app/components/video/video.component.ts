import { Component, OnInit, ElementRef} from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  private embed;
  private embedProps;
  
  constructor(private mpvService: MpvService, private subtitlesService: SubtitlesService, public elRef: ElementRef){
    this.embedProps = this.mpvService.mpv.getDefProps();
  }
  ngOnInit(){
    this.embed = this.elRef.nativeElement.querySelector('embed');
    this.mpvService.mpv.setPluginNode(this.embed);
  }
  ngAfterViewInit(){
    document.addEventListener("keydown", this.mpvService.handleKeyDown, false);
  }
  ngOnDestroy(){
    document.removeEventListener("keydown", this.mpvService.handleKeyDown, false);
  }
  ngDoCheck(){
    this.subtitlesService.findCurrentSubtitle();
  }
}
