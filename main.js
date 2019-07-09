"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var mpv_js_vanilla_1 = require("mpv.js-vanilla");
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
var pdir = path.join(path.dirname(require.resolve("mpv.js-vanilla")), 'build', 'Release');
if (process.platform !== 'linux') {
    process.chdir(pdir);
}
electron_1.app.commandLine.appendSwitch('ignore-gpu-blacklist');
electron_1.app.commandLine.appendSwitch('register-pepper-plugins', mpv_js_vanilla_1.getPluginEntry(pdir));
var win, serve, menu;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        // titleBarStyle: 'hidden',
        title: 'Step-by-step movie',
        webPreferences: {
            nodeIntegration: true,
            plugins: true
        },
    });
    createMenu();
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve) {
        win.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
function createMenu() {
    var mApplication = {
        label: "Application",
        submenu: [{
                label: "About Step-by-step movie",
                selector: "orderFrontStandardAboutPanel:"
            },
            {
                label: "Quit",
                accelerator: "Command+Q",
                click: function () {
                    electron_1.app.quit();
                }
            }
        ]
    };
    var mFile = {
        label: "File",
        submenu: [{
                label: "Open File",
                accelerator: "CmdOrCtrl+O",
                click: function () {
                    win.webContents.send('open-file');
                }
            },
        ]
    };
    var mEdit = {
        label: "Edit",
        submenu: [{
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                selector: "undo:"
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:"
            },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                selector: "cut:"
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                selector: "copy:"
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                selector: "paste:"
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:"
            }
        ]
    };
    var mPlayback = {
        label: "Playback",
        submenu: [{
                id: "toggle-pause",
                label: "Pause",
                accelerator: "space",
                // checked: false,
                // type: "checkbox",
                click: function () {
                    win.webContents.send('toggle-pause');
                }
            },
            // {
            //   label: "Reload",
            //   click: function () {
            //     win.webContents.send('reload')
            //   }
            // },
            {
                label: "Next Line",
                accelerator: "right",
                click: function () {
                    win.webContents.send('fast-forward');
                }
            },
            {
                label: "Previous Line",
                accelerator: "left",
                click: function () {
                    win.webContents.send('fast-backward');
                }
            },
            {
                label: "Speed Up",
                accelerator: "CmdOrCtrl+]",
                click: function () {
                    win.webContents.send('speed-up');
                }
            },
            {
                label: "Speed Down",
                accelerator: "CmdOrCtrl+[",
                click: function () {
                    win.webContents.send('speed-down');
                }
            },
            {
                label: "Speed Reset",
                accelerator: "CmdOrCtrl+\\",
                click: function () {
                    win.webContents.send('speed-reset');
                }
            },
        ]
    };
    // let mLoop = {
    //   label: "Loop",
    //   submenu: [{
    //       label: "Toggle Loop",
    //       accelerator: "enter",
    //       click: function () {
    //         win.webContents.send('toggle-loop')
    //       }
    //     },
    //     {
    //       label: "Extend Loop Left Range",
    //       accelerator: "[",
    //       click: function () {
    //         win.webContents.send('extend-loop-prev')
    //       }
    //     },
    //     {
    //       label: "Extend Loop Right Range",
    //       accelerator: "]",
    //       click: function () {
    //         win.webContents.send('extend-loop-next')
    //       }
    //     },
    //     {
    //       label: "Shrink Loop Left Range",
    //       accelerator: "{",
    //       click: function () {
    //         win.webContents.send('shrink-loop-prev')
    //       }
    //     },
    //     {
    //       label: "Shrink Loop Right Range",
    //       accelerator: "}",
    //       click: function () {
    //         win.webContents.send('shrink-loop-next')
    //       }
    //     },
    //     {
    //       label: "Loop Current Line with Times",
    //       submenu: [{
    //           label: "2 Times",
    //           accelerator: "2",
    //           click: function () {
    //             win.webContents.send('loop-times', 2);
    //           }
    //         },
    //         {
    //           label: "3 Times",
    //           accelerator: "3",
    //           click: function () {
    //             win.webContents.send('loop-times', 3);
    //           }
    //         },
    //         {
    //           label: "4 Times",
    //           accelerator: "4",
    //           click: function () {
    //             win.webContents.send('loop-times', 4);
    //           }
    //         },
    //         {
    //           label: "5 Times",
    //           accelerator: "5",
    //           click: function () {
    //             win.webContents.send('loop-times', 5);
    //           }
    //         },
    //         {
    //           label: "6 Times",
    //           accelerator: "6",
    //           click: function () {
    //             win.webContents.send('loop-times', 6);
    //           }
    //         },
    //         {
    //           label: "7 Times",
    //           accelerator: "7",
    //           click: function () {
    //             win.webContents.send('loop-times', 7);
    //           }
    //         },
    //         {
    //           label: "8 Times",
    //           accelerator: "8",
    //           click: function () {
    //             win.webContents.send('loop-times', 8);
    //           }
    //         },
    //         {
    //           label: "9 Times",
    //           accelerator: "9",
    //           click: function () {
    //             win.webContents.send('loop-times', 9);
    //           }
    //         },
    //         {
    //           label: "Forever",
    //           accelerator: "0",
    //           click: function () {
    //             win.webContents.send('loop-times', 0);
    //           }
    //         },
    //       ]
    //     },
    //   ]
    // };
    var mSubtitle = {
        label: "Subtitle",
        submenu: [
            // {
            //   label: "Reveal Subtitles in Finder",
            //   click: function () {
            //     win.webContents.send('reveal-subtitles')
            //   }
            // },
            {
                label: "Clear All Subtitles for the Current Movie",
                click: function () {
                    win.webContents.send('clear-subtitles');
                }
            },
            // {
            //   label: "Download Online Subtitles",
            //   click: function () {
            //     win.webContents.send('download-subtitles')
            //   }
            // },
            {
                label: "Add External Subtitle",
                click: function () {
                    win.webContents.send('add-external-subtitle');
                }
            },
            {
                label: "Popular Subtitle Sites",
                submenu: [{
                        label: "Opensubtitles.org",
                        click: function () {
                            electron_1.shell.openExternal("https://www.opensubtitles.org");
                        }
                    },
                    {
                        label: "Assrt.net (Chinese and English Subtitles)",
                        click: function () {
                            electron_1.shell.openExternal("https://assrt.net");
                        }
                    },
                ]
            },
            {
                label: "Subtitle Shift + 0.5s",
                accelerator: "CmdOrCtrl+right",
                click: function () {
                    win.webContents.send('add-subtitle-shift');
                }
            },
            {
                label: "Subtitle Shift - 0.5s",
                accelerator: "CmdOrCtrl+left",
                click: function () {
                    win.webContents.send('reduce-subtitle-shift');
                }
            },
            {
                label: "Reset Subtitle Shift",
                accelerator: "CmdOrCtrl+up",
                click: function () {
                    win.webContents.send('reset-subtitle-shift');
                }
            },
        ]
    };
    var mView = {
        label: "View",
        submenu: [{
                label: "Toggle Full Screen",
                accelerator: "F",
                click: function () {
                    win.webContents.send('toggle-full-screen');
                }
            },
            // {
            //   label: "Toggle Expanded View",
            //   accelerator: "CmdOrCtrl+E",
            //   click: function () {
            //     win.webContents.send('toggle-expand-view')
            //   }
            // },
            {
                label: "Toggle Side Panel",
                accelerator: "CmdOrCtrl+B",
                click: function () {
                    win.webContents.send('toggle-side-bar');
                }
            },
        ]
    };
    // let mWord = {
    //   label: "Word Book",
    //   submenu: [{
    //       label: "Add Selected Text to Word Book",
    //       click: function () {
    //         win.webContents.send('add-selection-to-word-book');
    //       }
    //     },
    //     {
    //       label: "Annotate Selected Text for Automatic Notification",
    //       click: function () {
    //         win.webContents.send('annotate-selected-text');
    //       }
    //     },
    //     {
    //       label: "Annotate Searched Word with Selected Text in Web Search Panel",
    //       click: function () {
    //         win.webContents.send('annotate-from-web-pane');
    //       }
    //     },
    //     {
    //       label: "Copy Words to Clipboard",
    //       click: function () {
    //         win.webContents.send('copy-word-book');
    //       }
    //     },
    //     {
    //       label: "Reveal Word Book File in Finder",
    //       click: function () {
    //         win.webContents.send('reveal-work-book-in-finder');
    //       }
    //     },
    //   ]
    // };
    // let mYouTube = {
    //   label: "YouTube",
    //   enabled: false,
    //   submenu: [{
    //       label: "Reload YouTube Video",
    //       id: "youtube-0",
    //       enabled: false,
    //       click: function () {
    //         win.webContents.send('reload-youtube');
    //       }
    //     },
    //     {
    //       label: 'Copy YouTube Video URL',
    //       id: "youtube-1",
    //       enabled: false,
    //       click: function () {
    //         win.webContents.send('copy-youtube-url');
    //       }
    //     },
    //     {
    //       label: 'Open YouTube Video in Default Browser',
    //       id: "youtube-2",
    //       enabled: false,
    //       click: function () {
    //         win.webContents.send('open-youtube-in-default-browser');
    //       }
    //     },
    //     {
    //       label: 'Open YouTube Video in Side Panel',
    //       id: "youtube-3",
    //       enabled: false,
    //       click: function () {
    //         win.webContents.send('open-youtube-in-side-panel');
    //       }
    //     },
    //   ]
    // };
    var mHelp = {
        role: 'help',
    };
    var template = [
        mApplication,
        mFile,
        mEdit,
        mPlayback,
        // mLoop,
        mSubtitle,
        mView,
        // mWord,
        // mYouTube,
        mHelp,
    ];
    menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
//# sourceMappingURL=main.js.map