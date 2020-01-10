import { Component, OnInit } from "@angular/core";
import { shell } from "electron";
import { serverApi, api, extension } from "easylang-extension";
import { MpvService } from "../../services/mpv.service";
@Component({
    selector: "app-word-counter",
    templateUrl: "./word-counter.component.html",
    styleUrls: ["./word-counter.component.scss"]
})
export class WordCounterComponent implements OnInit {
    public count: number = 0;
    constructor(private mpvService: MpvService) {
        window.addEventListener("message", e => {
            if (e.data.type === "hasAdd") {
                this.count++;
            }
        });
    }

    ngOnInit() {}

    openUrl() {
        let url = serverApi;
        if (extension.userToken && this.mpvService.state.filename) {
            api.getLessonIdByUrl(
                this.mpvService.state.filename,
                extension.userToken
            )
                .then(id => {
                    if (typeof id === 'number'){
                        shell.openExternal(url + "/sentences-list?lessonId=" + id);
                    }else{
                        shell.openExternal(url);
                    }
                })
        } else {
            shell.openExternal(url);
        }
    }
}
