import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { MpvService } from '../../services/mpv.service';

@Component({
  selector: 'app-item-subtitles-list',
  templateUrl: './item-subtitles-list.component.html',
  styleUrls: ['./item-subtitles-list.component.scss']
})
export class ItemSubtitlesListComponent implements OnInit {
  @Input() subtitle
  @Input() shift;

  constructor(private mpvService: MpvService, public elRef: ElementRef) { }

  ngOnInit() {
    
  }
  
  ngDoCheck(){
    // this.subtitle.isCurrent && this.elRef.nativeElement.scrollIntoView({block: 'center', behacior: 'smooth'});
  }
  
  onGoToSubtitle(){
    this.mpvService.setTimePos(this.subtitle.time + this.shift);
    console.log(this.subtitle.time)
  }

}
