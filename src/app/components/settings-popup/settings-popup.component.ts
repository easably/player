import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { SubtitlesService } from "../../services/subtitles.service";
import { MpvService } from "../../services/mpv.service";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: "app-settings-popup",
    templateUrl: "./settings-popup.component.html",
    styleUrls: ["./settings-popup.component.scss"]
})
export class SettingsPopupComponent implements OnInit {
    @Input() getGradientForRange;
    @ViewChild("speedRange", null) speedRangeEl: ElementRef;
    constructor(
        public subtitlesService: SubtitlesService,
        public mpvService: MpvService,
        public sanitizer: DomSanitizer
    ) {   }

    ngOnInit() {}

    toggleShowSubtitles(state?) {
        this.subtitlesService.toggleShowOnVideo(state);
    }
    selectSpeed(speed) {
        this.mpvService.changeSpeed(speed);
    }

    handleInputSpeed(e) {
        this.mpvService.changeSpeed(e.target.value);
    }
    handleClickSpeed(e) {
        e.target.blur();
    }
}
