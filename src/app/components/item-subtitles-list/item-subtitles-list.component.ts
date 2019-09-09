import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  MpvService
} from '../../services/mpv.service';
import { SubtitlesService } from '../../services/subtitles.service';

@Component({
  selector: 'app-item-subtitles-list',
  templateUrl: './item-subtitles-list.component.html',
  styleUrls: ['./item-subtitles-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSubtitlesListComponent implements OnInit {
  @Input() subtitle
  @Input() shift;
  @Input() isBetweenLine;
  @Input() contextMenuEvent;

  constructor(private mpvService: MpvService, private subtitlesService: SubtitlesService, public elRef: ElementRef) {

  }
  
  ngOnInit() {

  }

  ngOnChanges() {
    if (this.subtitle.isCurrent){
      this.elRef.nativeElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  }

  clickEvent(e) {
    if(e.shiftKey){
      document.getSelection().removeAllRanges();
      this.subtitlesService.addLoopSubtitle(this.subtitle)
    }else{
      !this.subtitle.isLoop && this.subtitlesService.clearLoop();
      this.mpvService.setTimePos(this.subtitle.time + this.shift);
      if (this.mpvService.state.pause) {
        this.mpvService.playSomeTime(this.subtitle.duration)
      }
    }
  }

}