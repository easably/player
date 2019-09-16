import { Component, OnInit, Input } from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  @Input() open: boolean;
  @Input() contextMenuEvent;
  public filterText: string = '';
  constructor(public mpvService: MpvService, public subtitlesService: SubtitlesService) { 

  }

  ngOnInit() {
  }
  
  onChangeLang(e){
    this.subtitlesService.currentSubtitleLanguageNumber = +e.target.id;
    // this.changeDetectedRef.detectChanges();
  }
  filterAudioTrack(arr){
    return arr.filter(t=>t.type === 'audio')
  }
  onChangeAudioTrack(e){
    this.mpvService.setAudioTrack(e.target.value);
    // this.changeDetectedRef.detectChanges();
  }
}
