import { Injectable, EventEmitter } from "@angular/core";
import { remote } from "electron";
import { MpvService } from "./mpv.service";
import * as fs from "fs";
import * as MatroskaSubtitles from "matroska-subtitles";
import * as parser from "subtitles-parser-vtt";
import SubtitlesPack from "../interfaces/subtitles-pack";
import { subtitleExtension } from "../../static/config.js";
// import detectEncoding from "node-autodetect-utf8-cp1251-cp866";

// import * as iconv from 'iconv-lite'

@Injectable({
    providedIn: "root"
})
export class SubtitlesService {
    public subtitles: SubtitlesPack[];
    public currentSubtitleKey: number = 0;
    public subtitleLoaded: EventEmitter<any> = new EventEmitter();
    public currentSubtitleLanguageNumber: number = 0;
    public shift: number = 0;
    public showOnVideo = true;
    constructor(private mpvService: MpvService) {}

    toggleShowOnVideo(state?) {
        if (state === undefined) {
            state = !this.showOnVideo;
        }
        this.showOnVideo = state;
    }

    getCurrentSubtitles() {
        if (!this.subtitles) return;
        return this.subtitles.filter(
            e => e.number === this.currentSubtitleLanguageNumber
        )[0];
    }
    changeSubtitleFormat(subtitle, fileName) {
        let newSubtitle: SubtitlesPack = subtitle.map(e => {
            return {
                text: e.text,
                time: +(e.startTime / 1000).toFixed(10),
                duration:
                    +(e.endTime / 1000).toFixed(10) -
                    +(e.startTime / 1000).toFixed(10)
            };
        });
        let genNewNumber = (num: number) => {
            if (!this.subtitles) return 0;
            else if (this.subtitles.every(e => e.number !== num)) return num;
            else return genNewNumber(num + 1);
        };
        let name: string = fileName.split("/");
        name = name[name.length - 1];
        let nameArr: string[] = name.split("\\");
        name = nameArr[nameArr.length - 1];
        nameArr = name.split(".");
        name = nameArr[nameArr.length - 2];
        return {
            language: name,
            subtitle: newSubtitle,
            number: genNewNumber(0)
        };
    }
    clearEnterSymbol(text: string) {
        return text.replace(/[\r\n↵]/g, " ");
    }

    loadSubtitles() {
        if (this.mpvService.state.duration === 0) return;
        let items: string[] = remote.dialog.showOpenDialog({
            filters: [
                {
                    name: "Subtitles",
                    extensions: subtitleExtension
                },
                {
                    name: "All files",
                    extensions: ["*"]
                }
            ]
        });
        if (items) {
            let srt = fs.readFileSync(items[0], "utf8");
            // let srt = iconv.decode(buff,'win1251');
            let subtitle: any = this.changeSubtitleFormat(
                parser.fromSrt(srt, true),
                items[0]
            );
            subtitle.subtitle.forEach(s => {
                s.text = this.clearEnterSymbol(s.text);
            });
            subtitle["subtitleShift"] = 0;
            if (!this.subtitles) this.subtitles = [];
            this.subtitles.push(subtitle);
            this.currentSubtitleLanguageNumber = subtitle.number;
        }
    }
    tryGetSubtitlesFromMkvFile(file) {
        let getSubtitles = () => {
            return new Promise((resolve, reject) => {
                let matroskaParser = new MatroskaSubtitles();
                let time;
                matroskaParser.once("tracks", tracks => {
                    time = performance.now();
                    this.subtitles = Object.assign(tracks);
                    this.subtitles.forEach(sub => {
                        sub.subtitleShift = 0;
                    });
                    this.currentSubtitleLanguageNumber = tracks[0].number;
                });

                // afterwards each subtitle is emitted
                matroskaParser.on("subtitle", (subtitle, trackNumber) => {
                    let oneSubtitle: SubtitlesPack = this.subtitles.filter(
                        e => e.number === trackNumber
                    )[0];
                    if (!oneSubtitle.subtitle) {
                        oneSubtitle.subtitle = [];
                    }
                    subtitle.text = this.clearEnterSymbol(subtitle.text);
                    subtitle.time = +(subtitle.time / 1000).toFixed(10);
                    subtitle.duration = +(subtitle.duration / 1000).toFixed(10);
                    oneSubtitle.subtitle.push(subtitle);
                    // this.subtitleLoaded.emit();
                });
                let stream = fs.createReadStream(file);
                this.subtitleLoaded.subscribe(e => {
                    if (e === null) {
                        stream.destroy();
                    }
                });
                stream.pipe(matroskaParser);
                stream.on("end", () => {
                    this.subtitleLoaded.emit();
                    time = performance.now() - time;
                    console.log(time);
                    resolve();
                });
            });
        };
        return new Promise((resolve, reject) => {
            if (file.split(".").pop() === "mkv") {
                getSubtitles().then(_ => resolve(this.subtitles));
            } else {
                this.subtitleLoaded.emit(null);
                this.subtitles = undefined;
                this.currentSubtitleLanguageNumber = undefined;
                reject();
            }
        });
    }
    findCurrentSubtitle() {
        if (this.subtitles) {
            if (!this.getCurrentSubtitles().subtitle) return;
            let videoTime: number = this.mpvService.state["time-pos"];
            const curSub = this.getCurrentSubtitle();
            if (
                curSub &&
                curSub.isCurrent &&
                videoTime >= curSub.time &&
                videoTime < curSub.time + curSub.duration
            )
                return;
            this.getCurrentSubtitles().subtitle.forEach((t, key) => {
                if (
                    videoTime >=
                    t.time + this.getCurrentSubtitles().subtitleShift
                ) {
                    this.currentSubtitleKey = key;
                }
                if (
                    videoTime >=
                        t.time + this.getCurrentSubtitles().subtitleShift &&
                    videoTime <
                        t.time +
                            this.getCurrentSubtitles().subtitleShift +
                            t.duration
                ) {
                    if (t.isCurrent !== true) {
                        t.isCurrent = true;
                    }
                } else if (t.isCurrent !== false) {
                    t.isCurrent = false;
                }
            });
        }
    }
    getCurrentSubtitle(key = this.currentSubtitleKey) {
        if (!this.getCurrentSubtitles().subtitle) return;
        return this.getCurrentSubtitles().subtitle[key];
    }
    setSubtitleByKey(key) {
        this.mpvService.setTimePos(
            this.getCurrentSubtitle(key).time +
                this.getCurrentSubtitles().subtitleShift
        );
    }
    setSubtitleRepeat() {
        if (this.subtitles) {
            this.setSubtitleByKey(this.currentSubtitleKey);
            if (this.mpvService.state.pause) {
                this.mpvService.playSomeTime(
                    this.getCurrentSubtitle().time,
                    this.getCurrentSubtitle().duration
                );
            }
        }
    }
    setSubtitlePrev() {
        if (this.subtitles) {
            if (this.currentSubtitleKey > 0)
                this.setSubtitleByKey(this.currentSubtitleKey - 1);
            else this.setSubtitleByKey(this.currentSubtitleKey);
            if (this.getLoopSubtitles().length ===1) this.clearLoop();
        } else {
            let time: number = this.mpvService.state["time-pos"];
            if (time >= 5) this.mpvService.setTimePos(time - 5);
            else this.mpvService.setTimePos(0);
        }
    }
    setSubtitleNext() {
        if (this.subtitles) {
            if (
                this.currentSubtitleKey <
                this.getCurrentSubtitles().subtitle.length - 1
            )
                this.setSubtitleByKey(this.currentSubtitleKey + 1);
            else
                this.setSubtitleByKey(
                    this.getCurrentSubtitles().subtitle.length - 1
                );
                if (this.getLoopSubtitles().length ===1) this.clearLoop();
        } else {
            let time: number = this.mpvService.state["time-pos"];
            if (time < this.mpvService.state.duration)
                this.mpvService.setTimePos(time + 5);
            else this.mpvService.setTimePos(this.mpvService.state.duration);
        }
    }
    clearSubtitles() {
        this.subtitleLoaded.emit(null);
        this.subtitles = undefined;
        this.currentSubtitleLanguageNumber = undefined;
    }
    changeSubtitleShift(time) {
        if (this.subtitles) this.getCurrentSubtitles().subtitleShift += time;
    }
    resetSubtitleShift() {
        if (this.subtitles) this.getCurrentSubtitles().subtitleShift = 0;
    }
    addLoopRangeSubtitle(endIndex, startIndex = this.currentSubtitleKey) {
        this.getCurrentSubtitles().subtitle[startIndex].isLoop = true;
        this.getCurrentSubtitles().subtitle[endIndex].isLoop = true;
        let [first, last] = this.getFirstAndLastLoopSubtitles();
        this.getCurrentSubtitles().subtitle.forEach(s => {
            if (s.time >= first.time && s.time <= last.time) {
                if (s.isLoop !== true) {
                    s.isLoop = true;
                }
            } else {
                if (s.isLoop !== false) {
                    s.isLoop = false;
                }
            }
        });
    }
    changeLoopOnSubtitleIndex(index, isAdd = true) {
        let isLoop = this.getCurrentSubtitles().subtitle[index].isLoop;
        if (isLoop !== isAdd) {
            this.getCurrentSubtitles().subtitle[index].isLoop = isAdd;
        }
    }
    clearLoop() {
        this.getCurrentSubtitles().subtitle.forEach(s => {
            if (s.isLoop !== false) {
                s.isLoop = false;
            }
        });
    }
    getFirstAndLastLoopSubtitles() {
        let first, last;
        let subtitles = this.getCurrentSubtitles().subtitle;
        let loopSubtitles = subtitles.filter(s => s.isLoop);
        loopSubtitles &&
            loopSubtitles.forEach((s, i) => {
                if (!first || s.time < first.time) first = s;
                if (!last || s.time + s.duration > last.time + last.duration)
                    last = s;
            });
        if (!first || !last) return;
        return [first, last];
    }
    getLoopTime() {
        if (!this.getCurrentSubtitles()) return;
        let subtitles = this.getCurrentSubtitles().subtitle;
        if (!subtitles) return;
        let index = this.getFirstAndLastLoopSubtitles();
        if (!index) return;
        let [first, last] = index;
        return {
            start: first.time,
            end: last.time + last.duration
        };
    }
    getIndexBySubtitle(subtitle) {
        let subtitles = this.getCurrentSubtitles().subtitle;
        for (let i = 0; i < subtitles.length; i++) {
            if (subtitles[i].time === subtitle.time) {
                return i;
            }
        }
    }
    toggleLoop() {
        if (!this.subtitles) return;
        const curSubtitle = this.getCurrentSubtitle();
        if (curSubtitle.isLoop) {
            this.clearLoop();
        } else {
            this.changeLoopOnSubtitleIndex(this.currentSubtitleKey, true);
        }
    }
    extendLoop(index = 0) {
        if (!this.subtitles) return;
        if (!this.getFirstAndLastLoopSubtitles()) {
            this.changeLoopOnSubtitleIndex(this.currentSubtitleKey, true);
        }
        const firstOrLast: number = index < 0 ? 0 : 1;
        const subtitleIndex: number =
            this.getIndexBySubtitle(
                this.getFirstAndLastLoopSubtitles()[firstOrLast]
            ) + index;
        const extendSubtitle = this.getCurrentSubtitles().subtitle[
            subtitleIndex
        ];
        if (extendSubtitle) {
            this.changeLoopOnSubtitleIndex(subtitleIndex, true);
        }
    }
    shrinkLoop(index = 0) {
        if (!this.subtitles) return;
        if (!this.getFirstAndLastLoopSubtitles()) {
            return;
        }
        const firstOrLast: number = index < 0 ? 0 : 1;
        const subtitleIndex: number = this.getIndexBySubtitle(
            this.getFirstAndLastLoopSubtitles()[firstOrLast]
        );
        const extendSubtitle = this.getCurrentSubtitles().subtitle[
            subtitleIndex
        ];
        if (extendSubtitle) {
            this.changeLoopOnSubtitleIndex(subtitleIndex, false);
        }
    }
    getLoopSubtitles() {
        const curSubtitles = this.getCurrentSubtitles();
        if (curSubtitles && curSubtitles.subtitle) {
            return curSubtitles.subtitle.filter(s => s.isLoop);
        }
        return;
    }
}
