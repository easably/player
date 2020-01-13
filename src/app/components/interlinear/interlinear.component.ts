import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from "@angular/core";
import { SubtitlesService } from "../../services/subtitles.service";
import Subtitle from "../../interfaces/subtitle";
import { MpvService } from "../../services/mpv.service";
import { extension, serverApi } from "easylang-extension";

@Component({
  selector: "app-interlinear",
  templateUrl: "./interlinear.component.html",
  styleUrls: ["./interlinear.component.scss"]
})
export class InterlinearComponent implements OnInit {
  @ViewChild("currentSubtitleRef", null) currentSubtitleRef: ElementRef;
  @ViewChild("translateFieldRef", null) translateFieldRef: ElementRef;
  @ViewChild("secondSubtitleRef", null) secondSubtitleRef: ElementRef;
  private mouseMovePaused = false;
  @HostListener("mousemove", ["$event"]) handleKeyEvent(e) {
    const fields = [
      this.currentSubtitleRef.nativeElement,
      this.translateFieldRef.nativeElement,
      this.secondSubtitleRef.nativeElement
    ];

    if (fields.some(f => f.contains(e.target))) {
      if (!this.mpvService.state.pause) {
        this.mpvService.setPause(true);
        this.mouseMovePaused = true;
      }
    } else if (this.mpvService.state.pause && this.mouseMovePaused) {
      this.mpvService.setPause(false);
      this.mouseMovePaused = false;
    }
  }
  private selectedText = "";
  public currentSubtitle: string = "";
  public translateText: string = "";
  public secondSubtitle: string = "";
  @HostListener("document:mouseup", ["$event"]) selectionEvent(e) {
    let getSelection = window.getSelection && window.getSelection();
    if (
      getSelection &&
      getSelection.rangeCount &&
      getSelection.rangeCount > 0
    ) {
      const text = getSelection.toString();
      if (
        this.currentSubtitleRef.nativeElement.contains(
          getSelection.getRangeAt(0).commonAncestorContainer
        ) &&
        text &&
        text !== this.selectedText
      ) {
        const langFrom = this.subtitlesService.getLangCodeByNumber(
          this.subtitlesService.currentSubtitleLanguageNumber
        );
        const langTo = this.subtitlesService.getLangCodeByNumber(
          this.subtitlesService.secondSubtitleLanguageNumber
        );
        if (extension.userToken) {
          if (langTo !== langFrom) {
            fetch(serverApi + "/api/translation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: extension.userToken
              },
              body: JSON.stringify({
                from: 'en',
                text: text,
                to: 'ru'
              })
              // body: JSON.stringify({
              //   from: langFrom,
              //   text: text,
              //   to: langTo
              // })
            })
              .then(function(response) {
                return response.json();
              })
              .then(e => {
                if (e.translation){
                  this.translateText = text + " - " + e.translation;
								}else{
									throw 'error';
								}
								}).catch(e=>{
                  this.translateText = "<!--  Translate Error  --!>";
							});
          }else{
						this.translateText = text + " - " + text;
					}
        } else {
          this.translateText = "<!--  Log In Please  --!>";
        }
        this.selectedText = text;
      }
    }
  }

  constructor(
    public subtitlesService: SubtitlesService,
    public mpvService: MpvService
  ) {}

  ngOnInit() {}
  updateSubtitle(subtitles) {
    if (subtitles && subtitles.subtitle) {
      let subtitle: Subtitle = subtitles.subtitle.filter(t => t.isCurrent)[0];
      return subtitle ? subtitle.text : "";
    }
    return "";
  }

  ngDoCheck() {
    if (this.subtitlesService.subtitles) {
      this.currentSubtitle = this.updateSubtitle(
        this.subtitlesService.getCurrentSubtitles()
      );
      this.secondSubtitle = this.updateSubtitle(
        this.subtitlesService.getSecondSubtitles()
      );
    } else {
      this.currentSubtitle = "";
      this.secondSubtitle = "";
    }
  }
}
