import { Injectable } from "@angular/core";
import * as Store from "electron-store";

@Injectable({
    providedIn: "root"
})
export class StoreService {
    public store;
    public set: any = {
        custom: (name, value) => {
            value && this.store.set(name, value);
        },
        timePos: (path, time) => {
            time && this.store.set(`${path}.time`, time);
        },
        audioTrackId: (path, id) => {
            id && this.store.set(`${path}.audioId`, id);
        },
        subtitles: (path, subtitles) => {
            subtitles && this.store.set(`${path}.subtitles`, subtitles);
        },
        subtitlesId: (path, id) => {
            id && this.store.set(`${path}.subtitlesId`, id);
        },
        subtitlesId2: (path, id) => {
            id && this.store.set(`${path}.subtitlesId2`, id);
        },
        extensionData: data => {
            this.store.set(`extensionData`, data);
        }
    };
    public get: any = {
        custom: (name) => {
            return this.store.get(name);
        },
        timePos: path => {
            return this.store.get(`${path}.time`);
        },
        audioTrackId: path => {
            return this.store.get(`${path}.audioId`);
        },
        subtitles: path => {
            return this.store.get(`${path}.subtitles`);
        },
        subtitlesId: path => {
            return this.store.get(`${path}.subtitlesId`);
        },
        subtitlesId2: path => {
            return this.store.get(`${path}.subtitlesId2`);
        },
        extensionData: () => {
            return this.store.get(`extensionData`);
        }
    };
		public clear = ()=>{
			this.store.clear()
		}
    constructor() {
        this.store = new Store();
        const data = this.store.get(`extensionData`);
        if (!data){
            this.set.extensionData({
                languageFrom: "auto",
                languageTo: "ru",
                localSentence: [],
                exception: []
            });
        }
    }
    isExist(path) {
        return this.store.has(path);
    }
}
