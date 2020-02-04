import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
	public oneLineSubtitle: boolean = true;
	public repeatMode: boolean = false;
	constructor() { }
	setOneLineSubtitle(state){
		this.oneLineSubtitle = state;
	}
	setRepeatMode(state){
		this.repeatMode = state;
	}
}
