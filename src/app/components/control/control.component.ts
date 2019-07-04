import { Component, OnInit} from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';


@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {
  constructor(private mpvService: MpvService, private subtitlesService: SubtitlesService) {}

  handleSeekMouseUp = () => {
    this.mpvService.seeking = false;
  }
  handleSeekMouseDown = () => {
    this.mpvService.seeking = true;
  }
  handleSeek = (e) => {
    e.target.blur();
    const timePos = +e.target.value;
    this.mpvService.setTimePos(timePos);
  }
  handleLoad(e){
    e.target.blur();
    let file = this.mpvService.loadFile();
    this.subtitlesService.tryGetSubtitlesFromMkvFile(file);
  }
  handleStop(e){
    e.target.blur();
    this.mpvService.stop();
  }
  togglePause(e){
    e.target.blur();
    this.mpvService.togglePause();
  }
  ngOnInit() {
  }

}
