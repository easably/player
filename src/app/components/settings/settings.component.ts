import { Component, OnInit, Input } from '@angular/core';
import {SettingsService} from '../../services/settings.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
	@Input() closeSettings: any;
  constructor(public settingsService: SettingsService,) { }

	
  ngOnInit() {
  }

}
