import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { MpvService } from "../../services/mpv.service";
import { SubtitlesService } from "../../services/subtitles.service";
import { serverApi } from "easylang-extension";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SubtitlesListComponent} from '../subtitles-list/subtitles-list.component'

@Component({
    selector: "app-side-bar",
    templateUrl: "./side-bar.component.html",
    styleUrls: ["./side-bar.component.scss"]
})
export class SideBarComponent implements OnInit {
    @ViewChild(SubtitlesListComponent, null) subtitlesListComponent:SubtitlesListComponent;
    @Input() contextMenuEvent;
    @Input() onChangeTheme;
    public open: string;
    public sideBarWidth: number = 300;
    public isOffTransition:boolean = false;
    public api: SafeResourceUrl;
    public filterText: string = "";
    public iframeIsRefreshing: boolean = false;

    constructor(
        public mpvService: MpvService,
        public subtitlesService: SubtitlesService,
        public sanitizer: DomSanitizer
    ) {
        window.addEventListener('resize',this.handleResizeWindow.bind(this));
        this.api = this.sanitizer.bypassSecurityTrustResourceUrl(serverApi);
    }

    ngOnInit() {}

    calcMarginRight() {
        return !this.open ? -this.sideBarWidth : 0;
    }

    onChangeLang(e) {
        e.target.blur();
        this.subtitlesService.currentSubtitleLanguageNumber = +e.target.id;
        // this.changeDetectedRef.detectChanges();
    }
    filterAudioTrack(arr) {
        return arr.filter(t => t.type === "audio");
    }
    onChangeAudioTrack(e) {
        e.target.blur();
        this.mpvService.setAudioTrack(e.target.value);
        // this.changeDetectedRef.detectChanges();
    }
    onOpenSubtitles(e) {
        e.target.blur();
        this.subtitlesService.loadSubtitles();
    }
    openTab(tab: string) {
        if (this.open !== tab) {
            this.open = tab;
        } else {
            this.open = "";
        }
    }
    refreshIframe() {
        this.iframeIsRefreshing = true;
        setTimeout(() => {
            this.iframeIsRefreshing = false;
        }, 50);
    }
    onToggleTheme() {
        this.onChangeTheme();
    }

    handleResize(e){
        if (e.which !== 1) return;
        e.preventDefault();
        this.isOffTransition = true;
        let startX = e.pageX;
        let handleMove = (ev) => {
            const offsetX = startX - ev.pageX;
            const newWidth = this.sideBarWidth + offsetX;
            if (newWidth < document.documentElement.clientWidth-300 && newWidth >= 300){
                this.sideBarWidth = newWidth;
                startX = ev.pageX
            }
        }
        document.addEventListener('mousemove',handleMove)
        document.addEventListener('mouseup',_=>{
            this.isOffTransition = false;
            document.removeEventListener('mousemove',handleMove)
        })
    }
    handleResizeWindow(e){
        const maxWidth = document.documentElement.clientWidth-300;
        if (this.sideBarWidth > maxWidth){
            this.sideBarWidth = maxWidth;
        }
    }
    showSettingsForSelectedSubtitles(){
        if (this.subtitlesListComponent){
            return this.subtitlesListComponent.checkedList.length !== 0
        }
        return false;
    }
}
