import {Component,  OnInit} from '@angular/core';
import { MpvService } from '../../services/mpv.service';
import { SubtitlesService } from '../../services/subtitles.service';
import {ipcRenderer} from 'electron';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public openSideBar:boolean = false;
  constructor(private mpvService: MpvService, private subtitlesService: SubtitlesService){
    ipcRenderer.on('open-file', ()=>{
      let file:any = this.mpvService.loadFile();
      file && this.subtitlesService.tryGetSubtitlesFromMkvFile(file);
    });
    ipcRenderer.on('toggle-pause',()=>{
      this.mpvService.togglePause();
    });
    ipcRenderer.on('fast-forward',()=>{
      this.subtitlesService.setSubtitleNext();
    });
    ipcRenderer.on('fast-backward',()=>{
      this.subtitlesService.setSubtitlePrev();
    });
    ipcRenderer.on('speed-up',()=>{
      this.mpvService.speedUp();
    });
    ipcRenderer.on('speed-down',()=>{
      this.mpvService.speedDown();
    });
    ipcRenderer.on('speed-reset',()=>{
      this.mpvService.speedReset();
    });
    ipcRenderer.on('clear-subtitles',()=>{
      this.subtitlesService.clearSubtitles();
    });
    ipcRenderer.on('add-external-subtitle',()=>{
      if (this.mpvService.state.duration)
        this.subtitlesService.loadSubtitles();
    });
    ipcRenderer.on('add-subtitle-shift',()=>{
      this.subtitlesService.changeSubtitleShift(0.5);
    });
    ipcRenderer.on('reduce-subtitle-shift',()=>{
      this.subtitlesService.changeSubtitleShift(-0.5);
    });
    ipcRenderer.on('reset-subtitle-shift',()=>{
      this.subtitlesService.resetSubtitleShift();
    });
    ipcRenderer.on('toggle-full-screen',()=>{
      this.mpvService.toggleFullscreen();
    });
    ipcRenderer.on('toggle-side-bar',()=>{
      this.toggleOpenSideBar();
    });
  }
  ngOnInit(){}
  toggleOpenSideBar(){
    this.openSideBar = !this.openSideBar;
  }
}
