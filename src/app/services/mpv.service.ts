import { Injectable } from '@angular/core';
import { MpvJs } from 'mpv.js-vanilla';
import {remote} from 'electron';

@Injectable({
  providedIn: 'root'
})
export class MpvService {
  public mpv: MpvJs;
  public state: any =  {pause: false, "time-pos": 0, duration: 0, fullscreen: false};
  public seeking: boolean;
  
  constructor() {
    this.mpv = new MpvJs(this.handleMPVReady, this.handlePropertyChange);
  }
  handleMPVReady = (mpv) => {
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    this.mpv.property("hwdec", "auto");
  }
  handlePropertyChange = (name, value) => {
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    } else {
      this.state[name] = value;
    }
  }
  handleKeyDown = (e) => {
    e.preventDefault();
    if (e.key === "f" || (e.key === "Escape" && this.state.fullscreen)) {
      this.toggleFullscreen();
    } else if (this.state.duration) {
      this.mpv.keypress(e);
    }
  }
  toggleFullscreen = () => {
    if (this.state.fullscreen) {
      document['webkitExitFullscreen']();
    } else {
      this.mpv.fullscreen();
    }
    this.state.fullscreen = !this.state.fullscreen;
  }
  togglePause = (e) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.property("pause", !this.state.pause);
  }
  handleStop = (e) => {
    e.target.blur();
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.state['time-pos'] = 0;
    this.state.duration = 0;
  }
  handleLoad = (e) => {
    e.target.blur();
    const items = remote.dialog.showOpenDialog({
      filters: [{
          name: "Videos",
          extensions: ["mkv", "webm", "mp4", "mov", "avi"]
        },
        {
          name: "All files",
          extensions: ["*"]
        },
      ]
    });
    if (items) {
      this.mpv.command("loadfile", items[0]);
      this.togglePause(e);

    }
  }
}
