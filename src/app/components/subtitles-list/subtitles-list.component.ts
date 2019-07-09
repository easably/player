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
  constructor(private mpvService: MpvService, private subtitlesService: SubtitlesService, private changeDetectedRef: ChangeDetectorRef) { 

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
    this.subtitlesService.currentSubtitleLanguageNumber = +e.target.value;
    console.log(this.mpvService);

    // this.changeDetectedRef.detectChanges();
  }
}
