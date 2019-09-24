import { Component, OnInit, Input} from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {
  @Input() openFile;
  @Input() closeFile;
  constructor(public mpvService: MpvService, private subtitlesService: SubtitlesService) {}

  handleSeekMouseUp(){
    this.mpvService.seeking = false;
  }
  handleSeekMouseDown(){
    this.mpvService.seeking = true;
  }
  handleSeek(e){
    e.target.blur();
    const timePos: number = +e.target.value;
    this.mpvService.setTimePos(timePos);
  }
  // handleLoad(e){
  //   e.target.blur();
  //   this.openFile();
  // }
  handleFullscreen(e){
    e.target.blur();
    this.mpvService.toggleFullscreen();
  }
  handleStop(e){
    e.target.blur();
    this.closeFile();
  }
  togglePause(e){
    e.target.blur();
    this.mpvService.togglePause();
  }
  ngOnInit() {
  }

}
