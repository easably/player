import { Component, OnInit } from '@angular/core';
import {SubtitlesService} from '../../services/subtitles.service'
import { MpvService } from '../../services/mpv.service';
@Component({
  selector: 'app-settings-popup',
  templateUrl: './settings-popup.component.html',
  styleUrls: ['./settings-popup.component.scss']
})
export class SettingsPopupComponent implements OnInit {
    public page: string;
  constructor(public subtitlesService: SubtitlesService, public mpvService: MpvService) { 
      this.page = 'home';
  }

  ngOnInit() {
  }

  toggleShowSubtitles(state?){
    this.subtitlesService.toggleShowOnVideo(state)
  }
  selectSpeed(speed){
    this.mpvService.changeSpeed(speed);
    this.page = 'home';
  }
}
