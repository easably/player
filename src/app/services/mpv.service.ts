import { Injectable } from '@angular/core';
import { MpvJs } from 'mpv.js-vanilla';
import {remote} from 'electron';

@Injectable({
  providedIn: 'root'
})
export class MpvService {
  public mpv: MpvJs;
  public state: any =  {pause: false, "time-pos": 0, duration: 0, fullscreen: false, speed: 1};
  public seeking: boolean;

  constructor() {
    this.mpv = new MpvJs(this.handleMPVReady, this.handlePropertyChange);
  }
  setTimePos = (timePos)=>{
    this.state["time-pos"] = timePos;
    this.mpv.property("time-pos", timePos);
  }
  
  handleMPVReady = (mpv)=>{
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached","speed"].forEach(observe);
    this.mpv.property("hwdec", "auto");
  }
  handlePropertyChange = (name, value)=>{
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    } else {
      this.state[name] = value;
    }
  }
  handleKeyDown=(e)=>{
    // console.log(e);
    // e.preventDefault();
    // if (e.key === "f" || (e.key === "Escape" && this.state.fullscreen)) {
    //   this.toggleFullscreen();
    // } else if (this.state.duration) {
      // if (e.key === ' '){
      //   this.mpv.keypress(e);
      // }else if(e.keyCode === 82){
      //   this.setSubtitleRepeat();
      // }else if(e.key === 'ArrowLeft'){
      //   this.setSubtitlePrev();
      // }else if(e.key === 'ArrowRight'){
      //   this.setSubtitleNext();
      // }
    // }
  }
  toggleFullscreen(){
    let win = remote.getCurrentWindow();
    if (this.state.fullscreen) {
      // document['webkitExitFullscreen']();
      win.setFullScreen(false);
    } else {
      // this.mpv.fullscreen();
      win.setFullScreen(true);
    }
    console.log(win);
    this.state.fullscreen = !this.state.fullscreen;
  }
  togglePause(){
    if (!this.state.duration) return;
    this.mpv.property("pause", !this.state.pause);
  }
  stop(){
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.state['time-pos'] = 0;
    this.state.duration = 0;
  }
  loadFile(){
    let items = remote.dialog.showOpenDialog({
      filters: [{
          name: "Videos",
          extensions: ["mkv", "webm", "mp4", "mov", "avi"]
        },
        {
          name: "All files",
          extensions: ["*"]
        },
      ]
    })
    if (items) {
      this.mpv.command("loadfile", items[0]);
      this.mpv.property("pause", false);
      this.speedReset();
      return items[0];
    }
  }
  speedUp(){
    let speed =  +(this.state.speed * 1.5).toFixed(10);
    if (speed > 100)
      return
    this.changeSpeed(speed);
  }
  speedDown(){
    let speed = this.state.speed = +(this.state.speed / 1.5).toFixed(10);
    if (speed < 0.01)
      return;
    this.changeSpeed(speed);
  }
  speedReset(){
    this.changeSpeed(1);
  }
  changeSpeed(e){
    this.mpv.property('speed',e);
  }
}
