import { Component, OnInit, Input } from '@angular/core';
import { MpvService } from '../../services/mpv.service';

@Component({
  selector: 'app-item-subtitles-list',
  templateUrl: './item-subtitles-list.component.html',
  styleUrls: ['./item-subtitles-list.component.scss']
})
export class ItemSubtitlesListComponent implements OnInit {
  @Input() subtitle;

  constructor(private mpvService: MpvService) { }

  ngOnInit() {
    
  }
  
  onGoToSubtitle(){
    this.mpvService.setTimePos(this.subtitle.time);
    console.log(this.subtitle.time)
  }

}
