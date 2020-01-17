import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
	public oneLineSubtitle: boolean = true;
	constructor() { }
	setOneLineSubtitle(state){
		this.oneLineSubtitle = state;
	}
}
