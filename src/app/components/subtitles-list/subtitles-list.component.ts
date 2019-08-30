import { Component, OnInit, ChangeDetectorRef, ElementRef, Input} from '@angular/core';
import { MpvService} from '../../services/mpv.service'
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-subtitles-list',
  templateUrl: './subtitles-list.component.html',
  styleUrls: ['./subtitles-list.component.scss']
})
export class SubtitlesListComponent implements OnInit {
  @Input() open;
  constructor(private mpvService: MpvService, public subtitlesService: SubtitlesService, private changeDetectedRef: ChangeDetectorRef) { 

  }
  
  ngOnInit() { 
    this.subtitlesService.subtitleLoaded.subscribe(()=>{
      this.changeDetectedRef.detectChanges();
    });

  }
  ngDoCheck(){
    // this.changeDetectedRef.detectChanges();

  }
  onChangeLang(e){
    this.subtitlesService.currentSubtitleLanguageNumber = +e.target.id;
    // this.changeDetectedRef.detectChanges();
  }
}
