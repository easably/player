import { Component, OnInit, Input } from '@angular/core';
import { shell } from 'electron';
import {
  videoExtensions
} from '../../../static/config.js'

@Component({
  selector: 'app-open-file-popup',
  templateUrl: './open-file-popup.component.html',
  styleUrls: ['./open-file-popup.component.scss']
})
export class OpenFilePopupComponent implements OnInit {
  @Input() openFile;

  constructor() { }

  openUrl(url){
    shell.openExternal(url)
  }
  openDropFile(e){
    const file: string = e.dataTransfer.files[0].path;
    const ext: string = file.split('.').pop();
    if (videoExtensions.some(e=>e===ext)){
      this.openFile(file)
    }
  }

  ngOnInit() {
  }

}
