import {
  Component,
  OnInit,
  NgZone
} from '@angular/core';
import {
  MpvService
} from '../../services/mpv.service';
import {
  SubtitlesService
} from '../../services/subtitles.service';
import {
  ipcRenderer,
  remote
} from 'electron';
import {
  videoExtensions
} from '../../../static/config.js'
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public openSideBar: boolean = false;
  constructor(public mpvService: MpvService, private subtitlesService: SubtitlesService, private _ngZone: NgZone) {
    this.mpvService.stopAdditional = this.subtitlesService.clearSubtitles.bind(this.subtitlesService)
    ipcRenderer.on('open-file-with', (ev, arg) => {
      this.openFile(arg)
    });
    ipcRenderer.on('open-file', () => {
      this.openFile()
    });
    ipcRenderer.on('toggle-pause', () => {
      this.mpvService.togglePause();
    });
    ipcRenderer.on('fast-forward', () => {
      this.subtitlesService.setSubtitleNext();
    });
    ipcRenderer.on('fast-backward', () => {
      this.subtitlesService.setSubtitlePrev();
    });
    ipcRenderer.on('fast-repeat', () => {
      this.subtitlesService.setSubtitleRepeat();
    });
    ipcRenderer.on('speed-up', () => {
      this.mpvService.speedUp();
    });
    ipcRenderer.on('speed-down', () => {
      this.mpvService.speedDown();
    });
    ipcRenderer.on('speed-reset', () => {
      this.mpvService.speedReset();
    });
    ipcRenderer.on('clear-subtitles', () => {
      this.subtitlesService.clearSubtitles();
    });
    ipcRenderer.on('add-external-subtitle', () => {
      if (this.mpvService.state.duration)
        this.subtitlesService.loadSubtitles();
    });
    ipcRenderer.on('add-subtitle-shift', () => {
      this.subtitlesService.changeSubtitleShift(0.5);
    });
    ipcRenderer.on('reduce-subtitle-shift', () => {
      this.subtitlesService.changeSubtitleShift(-0.5);
    });
    ipcRenderer.on('reset-subtitle-shift', () => {
      this.subtitlesService.resetSubtitleShift();
    });
    ipcRenderer.on('toggle-full-screen', () => {
      this.mpvService.toggleFullscreen();
    });
    ipcRenderer.on('toggle-side-bar', () => {
      this.toggleOpenSideBar();
    });
    ipcRenderer.on('next-audio-track', (e, isNext: boolean) => {
      this.mpvService.nextAudioTrack(isNext);
    });
    ipcRenderer.on('toggle-loop', () => {
      this._ngZone.run(() => this.subtitlesService.toggleLoop());
    });
    ipcRenderer.on('extend-loop-prev', () => {
      this._ngZone.run(() => this.subtitlesService.extendLoop(-1));
    });
    ipcRenderer.on('extend-loop-next', () => {
      this._ngZone.run(() => this.subtitlesService.extendLoop(1));
    });
    ipcRenderer.on('shrink-loop-prev', () => {
      this._ngZone.run(() => this.subtitlesService.shrinkLoop(1));
    });
    ipcRenderer.on('shrink-loop-next', () => {
      this._ngZone.run(() => this.subtitlesService.shrinkLoop(-1));
    });
  }
  ngOnInit() {}

  openFile(existFile = undefined) {
    let _openFile = (file) => {
      this.mpvService.loadFile(file);
      this.subtitlesService.tryGetSubtitlesFromMkvFile(file);
      this.toggleOpenSideBar(true)
    }
    if (existFile) {

      _openFile(existFile);
    } else {
      let win = remote.getCurrentWindow();
      let items: string[] = remote.dialog.showOpenDialog(win, {
        filters: [{
            name: "Videos",
            extensions: videoExtensions
          },
          {
            name: "All files",
            extensions: ["*"]
          },
        ]
      })
      if (items) {
        _openFile(items[0])
      }
    }
  }
  toggleOpenSideBar(state: boolean = undefined) {
    switch (state) {
      case undefined:
        this.openSideBar = !this.openSideBar;
        break;
      case true:
        this.openSideBar = true;
        break;
      case false:
        this.openSideBar = false;
        break;
    }
  }
  contextMenuEvent(e, text) {
    e.preventDefault();
    e.stopPropagation();
    ipcRenderer.send('openPopup', text)
  }
}