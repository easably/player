import { Component, OnInit } from '@angular/core';
import {SettingsService} from '../../services/settings.service'

@Component({
  selector: 'app-subtitle-settings',
  templateUrl: './subtitle-settings.component.html',
  styleUrls: ['./subtitle-settings.component.scss']
})
export class SubtitleSettingsComponent implements OnInit {

  constructor(public settingsService: SettingsService,) { }

  ngOnInit() {
	}
	
	handleClickSwitcher(e){
		this.settingsService.setRepeatMode(e.currentTarget.checked)
	}

}
