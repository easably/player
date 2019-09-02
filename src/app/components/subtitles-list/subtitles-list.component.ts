import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-subtitles-list',
  templateUrl: './subtitles-list.component.html',
  styleUrls: ['./subtitles-list.component.scss']
})
export class SubtitlesListComponent implements OnInit {

  constructor( public subtitlesService: SubtitlesService, private changeDetectedRef: ChangeDetectorRef) { 

  }
  
  ngOnInit() { 
    this.subtitlesService.subtitleLoaded.subscribe(()=>{
      this.changeDetectedRef.detectChanges();
    });

  }
  ngDoCheck(){
    // this.changeDetectedRef.detectChanges();

  }
}
