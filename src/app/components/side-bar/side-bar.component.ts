import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import {
  MpvService
} from '../../services/mpv.service'
import {
  SubtitlesService
} from '../../services/subtitles.service';
import {
  serverApi
} from 'easylang-extension'
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  @Input() contextMenuEvent;
  public open: string;
  public api: SafeResourceUrl;
  public filterText: string = '';
  public iframeIsRefreshing:boolean = false;
  constructor(public mpvService: MpvService, public subtitlesService: SubtitlesService, public sanitizer: DomSanitizer) {
    this.api = this.sanitizer.bypassSecurityTrustResourceUrl(serverApi);
  }

  ngOnInit() {

  }

  onChangeLang(e) {
    e.target.blur()
    this.subtitlesService.currentSubtitleLanguageNumber = +e.target.id;
    // this.changeDetectedRef.detectChanges();
  }
  filterAudioTrack(arr) {
    return arr.filter(t => t.type === 'audio')
  }
  onChangeAudioTrack(e) {
    e.target.blur()
    this.mpvService.setAudioTrack(e.target.value);
    // this.changeDetectedRef.detectChanges();
  }
  onOpenSubtitles(e) {
    e.target.blur();
    this.subtitlesService.loadSubtitles()
  }
  openTab(tab: string){
    if (this.open !== tab){
      this.open = tab;
    }else {
      this.open = '';
    }
  }
  refreshIframe(){
    this.iframeIsRefreshing = true;
    setTimeout(()=>{
      this.iframeIsRefreshing = false
    },50);
  }
}