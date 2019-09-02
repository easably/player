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
  @Input() isBetweenLine;

  private isAlreadyScroll:boolean = false;
  constructor(private mpvService: MpvService, public elRef: ElementRef) {   }

  ngOnInit() {
    
  }
  
  ngDoCheck(){
    if (this.subtitle.isCurrent && !this.isAlreadyScroll)
    {
      this.elRef.nativeElement.scrollIntoView({block: 'center', behavior: 'smooth'});
      this.isAlreadyScroll = true;
    }else if (!this.subtitle.isCurrent && this.isAlreadyScroll){
      this.isAlreadyScroll = false;
    }
  }
  
  onGoToSubtitle(){
    this.mpvService.setTimePos(this.subtitle.time + this.shift);
    if(this.mpvService.state.pause){
      this.mpvService.playSomeTime(this.subtitle.duration)
    }
  }

}
