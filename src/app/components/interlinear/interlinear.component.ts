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
  @ViewChild("addBtnRef", null) addBtnRef: ElementRef;
  // private mouseMovePaused = false;
  // @HostListener("mousemove", ["$event"]) handleKeyEvent(e) {
  //   const fields = [
  //     this.currentSubtitleRef && this.currentSubtitleRef.nativeElement,
  //     this.translateFieldRef && this.translateFieldRef.nativeElement,
  // 		this.translateFieldRef && this.translateFieldRef.nativeElement,
  // 		this.addBtnRef && this.addBtnRef.nativeElement
  //   ];
  //   if (fields.some(f => f && f.contains(e.target))) {
  //     if (!this.mpvService.state.pause) {
  //       this.mpvService.setPause(true);
  //       this.mouseMovePaused = true;
  //     }
  //   } else if (this.mpvService.state.pause && this.mouseMovePaused) {
  //     this.mpvService.setPause(false);
  //     this.mouseMovePaused = false;
  //   }
  // }
  private selectedText = "";
  public currentSubtitle: string = "";
  public translateText: string = "";
  public secondSubtitle: string = "";
  public isAddAvailable: boolean = false;
  public isAdded: boolean = false;
  private selectedWord: any = [0, 0];
  private fullTextWhenSelected: string = "";
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
        this.isAdded = false;
        const range = getSelection.getRangeAt(0);
        this.selectedWord = [
          range.startOffset,
          range.endOffset - range.startOffset
        ];
        this.fullTextWhenSelected = range.commonAncestorContainer.textContent;
        const langFrom = this.subtitlesService.getLangCodeByNumber(
          this.subtitlesService.currentSubtitleLanguageNumber
        );
        const langTo = this.subtitlesService.getLangCodeByNumber(
          this.subtitlesService.secondSubtitleLanguageNumber
        );
        if (langTo !== langFrom) {
          fetch(serverApi + "/api/translation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "en",
              text: text,
              to: "ru"
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
              if (e.translation) {
                this.translateText = text + " - " + e.translation;
              } else {
                throw "error";
              }
            })
            .catch(e => {
              this.translateText = "<!--  Translate Error  --!>";
            });
        } else {
          this.translateText = text + " - " + text;
        }
        if (extension.userToken) {
          this.isAddAvailable = true;
        } else {
          this.isAddAvailable = false;
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
      const newCurSub = this.updateSubtitle(
        this.subtitlesService.getCurrentSubtitles()
      );
      if (newCurSub !== this.currentSubtitle) {
        this.translateText = "";
      }
      this.currentSubtitle = newCurSub;
      this.secondSubtitle = this.updateSubtitle(
        this.subtitlesService.getSecondSubtitles()
      );
    } else {
      this.currentSubtitle = "";
      this.secondSubtitle = "";
    }
  }

  headers(token) {
    return {
      "Content-Type": "application/json",
      Authorization: token
    };
  }

  getLessonIdByUrl(url, token) {
    return fetch("https://easy4learn.com/api/lessons/idbyurl?url=" + url, {
      headers: this.headers(token)
    }).then(function(response) {
      return response.json();
    });
  }

  addLessons(body: any, token: any) {
    return fetch("https://easy4learn.com/api/lessons", {
      method: "POST",
      headers: this.headers(token),
      body: JSON.stringify(body)
    }).then(function(response) {
      return response.json();
    });
  }

  addSentence(body, token) {
    return fetch("https://easy4learn.com/api/sentences", {
      method: "POST",
      headers: this.headers(token),
      body: JSON.stringify(body)
    }).then(function(response) {
      return response.json();
    });
  }

  checkAndPostAddLesson(title, url) {
    return this.getLessonIdByUrl(url, extension.userToken).then(resp => {
      if (!resp.id) {
        return this.addLessons(
          {
            name: title,
            url: url
          },
          extension.userToken
        ).then(response => {
          return new Promise((resolve, reject) => {
            resolve(response.id);
          });
        });
      }
      return new Promise((resolve, reject) => {
        resolve(resp.id);
      });
    });
  }
  addWord(data, titlePage, url) {
    return this.checkAndPostAddLesson(titlePage, url).then(id =>
      this.addSentence({ lessonId: id, ...data }, extension.userToken)
    );
  }
  handleClickAdd() {
    this.addWord(
      {
        words: [this.selectedWord],
        text: this.fullTextWhenSelected
      },
      this.mpvService.state.filename,
      "player:" + this.mpvService.state.filename
    ).then(_ => {
      console.log("ok");
      this.isAdded = true;
    });
  }
}
