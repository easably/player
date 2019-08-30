import {
  Injectable
} from '@angular/core';
import {
  MpvJs
} from 'mpv.js-vanilla';
import {
  remote
} from 'electron';

@Injectable({
  providedIn: 'root'
})
export class MpvService {
  public mpv: MpvJs;
  public state: any = {
    pause: false,
    "time-pos": 0,
    duration: 0,
    fullscreen: false,
    speed: 1,
    trackList: []
  };
  public seeking: boolean;
  private maxCountTrack: number = 100;

  constructor() {
    this.mpv = new MpvJs(this.handleMPVReady, this.handlePropertyChange);
  }
  setTimePos = (timePos) => {
    this.state["time-pos"] = timePos;
    this.mpv.property("time-pos", timePos);
  }

  handleMPVReady = (mpv) => {
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached", "speed", "track-list/count", "options/aid"].forEach(observe);
    for (let i = 0; i < this.maxCountTrack; i++) {
      observe(`track-list/${i}/id`)
      observe(`track-list/${i}/type`)
      observe(`track-list/${i}/lang`)
      observe(`track-list/${i}/selected`)
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
          this.state.trackList[index] = {}
        this.state.trackList[index][type] = value;
      }
    } else {
      this.state[name] = value;
    }
  }
  toggleFullscreen() {
    let win = remote.getCurrentWindow();
    if (this.state.fullscreen) {
      document['webkitExitFullscreen']();
      // win.setFullScreen(false);
    } else {
      this.mpv.fullscreen();
      // win.setFullScreen(true);
    }
    console.log(win);
    this.state.fullscreen = !this.state.fullscreen;
  }
  togglePause() {
    if (!this.state.duration) return;
    this.mpv.property("pause", !this.state.pause);
  }
  stop() {
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.state['time-pos'] = 0;
    this.state.duration = 0;
  }
  loadFile() {
    let win = remote.getCurrentWindow();
    let items = remote.dialog.showOpenDialog(win, {
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