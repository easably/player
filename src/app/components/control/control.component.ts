import { Component, OnInit} from '@angular/core';
import { MpvService} from '../../services/mpv.service'


@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {
  
  constructor(private mpvService: MpvService) { }

  handleSeekMouseUp = () => {
    this.mpvService.seeking = false;
  }
  handleSeekMouseDown = () => {
    this.mpvService.seeking = true;
  }
  handleSeek = (e) => {
    e.target.blur();
    const timePos = +e.target.value;
    this.mpvService.state["time-pos"] = timePos;
    this.mpvService.mpv.property("time-pos", timePos);
  }
  ngOnInit() {
  }

}
