import {
  Injectable
} from '@angular/core';
import {
  MpvJs
} from 'mpv.js-vanilla';
import {
  remote
} from 'electron';
import mpvState from '../interfaces/mpv-state'

@Injectable({
  providedIn: 'root'
})
export class MpvService {
  public mpv: MpvJs;
  public state: mpvState = {
    pause: false,
    "time-pos": 0,
    duration: 0,
    fullscreen: false,
    speed: 1,
    trackList: [],
    filename: '',
    path: ''
  };
  public seeking: boolean;
  private maxCountTrack: number = 100;

  constructor() {
    this.mpv = new MpvJs(this.handleMPVReady, this.handlePropertyChange);
  }
  setTimePos = (timePos) => {
    this.mpv.property("time-pos", timePos);
  }

  handleMPVReady = (mpv) => {
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached", "speed", "track-list/count", "options/aid","filename/no-ext","path"].forEach(observe);
    for (let i = 0; i < this.maxCountTrack; i++) {
      observe(`track-list/${i}/id`)
      observe(`track-list/${i}/type`)
      observe(`track-list/${i}/lang`)
      observe(`track-list/${i}/selected`)
      observe(`track-list/${i}/title`)
    }
    this.mpv.property("hwdec", "auto");
  }
  handlePropertyChange = (name, value) => {
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    }else if (name === 'options/aid'){
      if(value !== 'auto'){
        this.state.trackList.forEach(track=>{
          if (track.type === 'audio'){
            if (track.id === value){
              track.selected = true;
            }else{
              track.selected = false;
            }
          }
        })
      }
    } else if (name.indexOf('track-list') !== -1) {
      if (name === 'track-list/count'){
        this.state.trackList = [];
      }else{
        let [ , index, type] = name.match(/[^//]+/g);
        if (!this.state.trackList[index])
          this.state.trackList[index] = {
            id: undefined,
            lang: undefined,
            selected: undefined,
            type: undefined,
          }
        this.state.trackList[index][type] = value;
      }
    } else {
      if (name === 'filename/no-ext') name = 'filename';
      this.state[name] = value;
    }
  }
  toggleFullscreen() {
    let win = remote.getCurrentWindow();
    if (win.isFullScreen()) {
    //   document['webkitExitFullscreen']();
      win.setFullScreen(false);
      win.setMenuBarVisibility(true);
    } else {
    //   this.mpv.fullscreen();
      win.setFullScreen(true);
      win.setMenuBarVisibility(false);
    }
    this.state.fullscreen = win.isFullScreen();
  }
  togglePause() {
    this.setPause(!this.state.pause);
  }
  setPause(state = true){
    if (!this.state.duration) return;
    this.mpv.property("pause", state);
  }
  stop() {
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.state['time-pos'] = 0;
    this.state.duration = 0;
    this.stopAdditional();
  }
  stopAdditional(){

  }
  playSomeTime(startTime = this.state['time-pos'], duration, delay = 0){
    let error = 1;
    if (this.state.pause){
      this.setTimePos(startTime - delay)
      this.togglePause()
    }
    setTimeout(()=>{
      const time = Math.round(this.state['time-pos'])
      if (!this.state.pause && 
        time >= Math.round(startTime + duration + delay) - error && 
        time <= Math.round(startTime + duration + delay) + error
      ){
        this.togglePause()
      }
    }, (duration + 2*delay) * 1000)
  }
  loadFile(item) {
    this.mpv.command("loadfile", item);
    this.mpv.property("pause", false);
    this.speedReset();
    return item;
  }
  speedUp() {
    let speed = +(this.state.speed * 1.5).toFixed(10);
    if (speed > 100)
      return
    this.changeSpeed(speed);
  }
  speedDown() {
    let speed = this.state.speed = +(this.state.speed / 1.5).toFixed(10);
    if (speed < 0.01)
      return;
    this.changeSpeed(speed);
  }
  speedReset() {
    this.changeSpeed(1);
  }
  changeSpeed(e) {
    this.mpv.property('speed', e);
  }
  nextAudioTrack(isNext: boolean) {
    let audioTrackList = this.state.trackList.filter(t=>t.type === 'audio');
    if (audioTrackList.length == 0) return;
    let currentTrack = audioTrackList.filter(t=>t.selected === true)[0].id;

      if(audioTrackList.filter(t=>t.id === currentTrack + (isNext ? 1 : -1)).length !== 0){
        this.setAudioTrack(currentTrack + (isNext ? 1 : -1))
      }else{
        this.setAudioTrack(isNext ? 1 : audioTrackList[audioTrackList.length - 1].id);
      }

  }
  setAudioTrack(id: number){
    this.mpv.property('options/aid', id);

  }
}