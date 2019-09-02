import {Injectable, EventEmitter} from '@angular/core';
import {remote} from 'electron';
import {MpvService} from './mpv.service'
import * as fs from 'fs';
import * as MatroskaSubtitles from 'matroska-subtitles';
import * as parser from 'subtitles-parser-vtt';

@Injectable({
  providedIn: 'root'
})
export class SubtitlesService {
  public subtitles: any;
  public currentSubtitleKey: number = 0;
  public subtitleLoaded: EventEmitter < any > = new EventEmitter();
  public currentSubtitleLanguageNumber: number = 0;
  public shift: number = 0;
  constructor(private mpvService: MpvService) {}

  getCurrentSubtitles() {
    if (!this.subtitles) return [];
    return this.subtitles.filter(e => e.number === this.currentSubtitleLanguageNumber)[0]
  }
  changeSubtitleFormat(subtitle, fileName){
    let newSubtitle = subtitle.map(e=>{
      return {
        text:e.text,
        time:+(e.startTime/1000).toFixed(10),
        duration:+(e.endTime/1000).toFixed(10)-+(e.startTime/1000).toFixed(10),
      }
    });
    let genNewNumber = (num)=>{
      if (!this.subtitles) return 0;
      else if (this.subtitles.every(e=>e.number!==num)) return num;
      else return genNewNumber(num+1);
    }
    let name = fileName.split('/')
    name = name[name.length-1];
    name = name.split('.');
    name = name[name.length-2];
    return {
      language: name,
      subtitle: newSubtitle,
      number: genNewNumber(0)
    }
  }
  loadSubtitles(){
    if (this.mpvService.state.duration === 0) return;
    let items = remote.dialog.showOpenDialog({
      filters: [{
          name: "Subtitles",
          extensions: ["srt","vtt"]
        },
        {
          name: "All files",
          extensions: ["*"]
        },
      ]
    })
    if (items) {
      let srt = fs.readFileSync(items[0],'utf8');
      let subtitle = this.changeSubtitleFormat(parser.fromSrt(srt,true),items[0]);
      subtitle['subtitleShift'] = 0;
      if (!this.subtitles) this.subtitles = [];
      this.subtitles.push(subtitle);
      this.currentSubtitleLanguageNumber = subtitle.number;
    }
  }
  tryGetSubtitlesFromMkvFile(file) {
    let getSubtitles = ()=>{
      let matroskaParser = new MatroskaSubtitles();
      let time;
      matroskaParser.once('tracks', (tracks) => {
        time = performance.now();
        this.subtitles = Object.assign(tracks);
        this.subtitles.forEach(sub=>{
          sub.subtitleShift = 0;
        });
        console.log(this.subtitles)
        this.currentSubtitleLanguageNumber = tracks[0].number;
      })
  
      // afterwards each subtitle is emitted
      matroskaParser.on('subtitle', (subtitle, trackNumber) => {
        let oneSubtitle = this.subtitles.filter(e => e.number === trackNumber)[0];
        if (!oneSubtitle.subtitle) {
          oneSubtitle.subtitle = [];
        }
        subtitle.time = +(subtitle.time / 1000).toFixed(10);
        subtitle.duration = +(subtitle.duration / 1000).toFixed(10);
        oneSubtitle.subtitle.push(subtitle);
        this.subtitleLoaded.emit();
      })
      this.subtitleLoaded.subscribe(e => {
        if (e === null) {
          stream.destroy();
        }
      });
      let stream = fs.createReadStream(file);
      stream.pipe(matroskaParser)
      stream.on('end', () => {
        console.log(this.subtitles)
        time = performance.now() - time;
        console.log(time);
      })
    }

    if (file.split('.').pop() === 'mkv'){
      getSubtitles();
    }else{
      this.subtitleLoaded.emit(null);
      this.subtitles= undefined;
      this.currentSubtitleLanguageNumber = undefined;
    }
  }
  findCurrentSubtitle() {
    if (this.subtitles && this.getCurrentSubtitles().subtitle) {
      let videoTime = this.mpvService.state['time-pos'];
      this.getCurrentSubtitles().subtitle.forEach((t, key) => {
        if (videoTime >= t.time + this.getCurrentSubtitles().subtitleShift && videoTime < t.time + this.getCurrentSubtitles().subtitleShift + t.duration) {
          this.currentSubtitleKey = key;
          t.isCurrent = true;
        } else {
          t.isCurrent = false;
        }
      })
    }
  }
  getCurrentSubtitle(key = this.currentSubtitleKey){
    return this.getCurrentSubtitles().subtitle[key]
  }
  setSubtitleByKey(key) {
    this.mpvService.setTimePos(this.getCurrentSubtitle(key).time + this.getCurrentSubtitles().subtitleShift);
  }
  setSubtitleRepeat() {
    this.setSubtitleByKey(this.currentSubtitleKey);
    if(this.mpvService.state.pause){
      this.mpvService.playSomeTime(this.getCurrentSubtitle().duration)
    }
  }
  setSubtitlePrev() {
    if (this.subtitles) {
      if (this.currentSubtitleKey > 0)
        this.setSubtitleByKey(this.currentSubtitleKey - 1)
      else
        this.setSubtitleByKey(this.currentSubtitleKey)
    } else {
      let time = this.mpvService.state["time-pos"];
      if (time >= 5)
        this.mpvService.setTimePos(time - 5);
      else
        this.mpvService.setTimePos(0);
    }
  }
  setSubtitleNext() {
    if (this.subtitles) {
      if (this.currentSubtitleKey < this.getCurrentSubtitles().subtitle.length - 1)
        this.setSubtitleByKey(this.currentSubtitleKey + 1)
      else
        this.setSubtitleByKey(this.getCurrentSubtitles().subtitle.length - 1)
    } else {
      let time = this.mpvService.state["time-pos"];
      if (time < this.mpvService.state.duration)
        this.mpvService.setTimePos(time + 5)
      else
        this.mpvService.setTimePos(this.mpvService.state.duration)
    }
  }
  clearSubtitles(){
    this.subtitleLoaded.emit(null);
    this.subtitles= undefined;
    this.currentSubtitleLanguageNumber = undefined;
  }
  changeSubtitleShift(time){
    if (this.subtitles)
      this.getCurrentSubtitles().subtitleShift += time;
  }
  resetSubtitleShift(){
    if (this.subtitles)
      this.getCurrentSubtitles().subtitleShift = 0;
  }
}
