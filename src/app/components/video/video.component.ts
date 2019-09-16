import {
  Component,
  OnInit,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {
  MpvService
} from '../../services/mpv.service'
import {
  SubtitlesService
} from '../../services/subtitles.service';
import Subtitle from '../../interfaces/subtitle'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @ViewChild('embed',undefined) embed : ElementRef;
  @Input() contextMenuEvent;
  public embedProps: string;

  constructor(public mpvService: MpvService, private subtitlesService: SubtitlesService) {
    this.embedProps = this.mpvService.mpv.getDefProps();
  }
  ngOnInit() {
    this.mpvService.mpv.setPluginNode(this.embed.nativeElement);
  }
  loopBorderControl(){
    const loopSubtitles: Subtitle[] = this.subtitlesService.getLoopSubtitles();
    const curTime = this.mpvService.state['time-pos'];
    if (loopSubtitles && loopSubtitles.length > 0) {
      const [firstLoopSubtitle, lastLoopSubtitle] = [loopSubtitles[0], loopSubtitles[loopSubtitles.length - 1]]
      if (curTime < firstLoopSubtitle.time) {
        this.mpvService.setTimePos(lastLoopSubtitle.time)
      } else if (curTime >= lastLoopSubtitle.time + lastLoopSubtitle.duration) {
        this.mpvService.setTimePos(firstLoopSubtitle.time)
      }
    }
  }
  ngDoCheck() {
    this.embed.nativeElement.focus()
    this.subtitlesService.findCurrentSubtitle();
    this.loopBorderControl();
  }
}