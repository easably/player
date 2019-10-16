import { Component, OnInit, HostListener } from "@angular/core";
import { shell } from "electron";
import { serverApi } from "easylang-extension";
@Component({
    selector: "app-word-counter",
    templateUrl: "./word-counter.component.html",
    styleUrls: ["./word-counter.component.scss"]
})
export class WordCounterComponent implements OnInit {
    public count: number = 0;
    constructor() {
        window.addEventListener("message", e => {
            if (e.data.type === "hasAdd") {
                this.count++;
            }
        });
    }

    ngOnInit() {}

    openUrl() {
        shell.openExternal(serverApi);
    }
}
