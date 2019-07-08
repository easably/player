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
        webPreferences: {
            nodeIntegration: true,
            plugins: true
        },
    });
    electron_1.Menu.setApplicationMenu(menu);
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
var mApplication = {
    label: "Application",
    submenu: [{
            label: "About Source Player",
            selector: "orderFrontStandardAboutPanel:"
        },
        {
            type: "separator"
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
        {
            label: "Open YouTube Video",
            accelerator: "CmdOrCtrl++L",
            click: function () {
                win.webContents.send('open-url');
            }
        },
        {
            role: "recentDocuments",
            submenu: [{
                    label: 'Clear Recent',
                    click: function () {
                        electron_1.app.clearRecentDocuments();
                    }
                }]
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
            type: "separator"
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
            checked: false,
            type: "checkbox",
            click: function () {
                win.webContents.send('toggle-pause');
            }
        },
        {
            label: "Reload",
            click: function () {
                win.webContents.send('reload');
            }
        },
        {
            type: "separator"
        },
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
            type: "separator"
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
        {
            type: "separator"
        },
        {
            label: "Next Audio Track",
            click: function () {
                win.webContents.send('next-audio-track', true);
            }
        },
        {
            label: "Previous Audio Track",
            click: function () {
                win.webContents.send('next-audio-track', false);
            }
        },
    ]
};
var mLoop = {
    label: "Loop",
    submenu: [{
            label: "Toggle Loop",
            accelerator: "enter",
            click: function () {
                win.webContents.send('toggle-loop');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Extend Loop Left Range",
            accelerator: "[",
            click: function () {
                win.webContents.send('extend-loop-prev');
            }
        },
        {
            label: "Extend Loop Right Range",
            accelerator: "]",
            click: function () {
                win.webContents.send('extend-loop-next');
            }
        },
        {
            label: "Shrink Loop Left Range",
            accelerator: "{",
            click: function () {
                win.webContents.send('shrink-loop-prev');
            }
        },
        {
            label: "Shrink Loop Right Range",
            accelerator: "}",
            click: function () {
                win.webContents.send('shrink-loop-next');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Loop Current Line with Times",
            submenu: [{
                    label: "2 Times",
                    accelerator: "2",
                    click: function () {
                        win.webContents.send('loop-times', 2);
                    }
                },
                {
                    label: "3 Times",
                    accelerator: "3",
                    click: function () {
                        win.webContents.send('loop-times', 3);
                    }
                },
                {
                    label: "4 Times",
                    accelerator: "4",
                    click: function () {
                        win.webContents.send('loop-times', 4);
                    }
                },
                {
                    label: "5 Times",
                    accelerator: "5",
                    click: function () {
                        win.webContents.send('loop-times', 5);
                    }
                },
                {
                    label: "6 Times",
                    accelerator: "6",
                    click: function () {
                        win.webContents.send('loop-times', 6);
                    }
                },
                {
                    label: "7 Times",
                    accelerator: "7",
                    click: function () {
                        win.webContents.send('loop-times', 7);
                    }
                },
                {
                    label: "8 Times",
                    accelerator: "8",
                    click: function () {
                        win.webContents.send('loop-times', 8);
                    }
                },
                {
                    label: "9 Times",
                    accelerator: "9",
                    click: function () {
                        win.webContents.send('loop-times', 9);
                    }
                },
                {
                    label: "Forever",
                    accelerator: "0",
                    click: function () {
                        win.webContents.send('loop-times', 0);
                    }
                },
            ]
        },
    ]
};
var mSubtitle = {
    label: "Subtitle",
    submenu: [{
            label: "Reveal Subtitles in Finder",
            click: function () {
                win.webContents.send('reveal-subtitles');
            }
        },
        {
            label: "Clear All Subtitles for the Current Movie",
            click: function () {
                win.webContents.send('clear-subtitles');
            }
        },
        {
            label: "Download Online Subtitles",
            click: function () {
                win.webContents.send('download-subtitles');
            }
        },
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
            type: "separator"
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
        {
            type: "separator"
        },
        {
            label: "Filter Subtitle by Keyword",
            type: "checkbox",
            checked: true,
            click: function () {
                win.webContents.send('toggle-filter-by-search-term');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Search Selected Text in Dictionary",
            click: function () {
                win.webContents.send('search-selection-in-dictionary');
            }
        },
        {
            label: "Search Selected Text in Web",
            click: function () {
                win.webContents.send('search-selection-in-web-dictionary');
            }
        }
    ]
};
var mView = {
    label: "View",
    submenu: [{
            label: "Toggle Full Screen",
            accelerator: "Cmd+Ctrl+F",
            click: function () {
                win.webContents.send('toggle-full-screen');
            }
        },
        {
            label: "Toggle Expanded View",
            accelerator: "CmdOrCtrl+E",
            click: function () {
                win.webContents.send('toggle-expand-view');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Toggle Side Panel",
            accelerator: "CmdOrCtrl+B",
            click: function () {
                win.webContents.send('toggle-side-bar');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Open Subtitle Panel",
            accelerator: "CmdOrCtrl+1",
            click: function () {
                win.webContents.send('open-subtitle-pane');
            }
        },
        {
            label: "Open Word Panel",
            accelerator: "CmdOrCtrl+2",
            click: function () {
                win.webContents.send('open-word-pane');
            }
        },
        {
            label: "Open Web Search Panel",
            accelerator: "CmdOrCtrl+3",
            click: function () {
                win.webContents.send('open-web-pane');
            }
        },
        {
            label: "Open YouTube Panel",
            accelerator: "CmdOrCtrl+4",
            click: function () {
                win.webContents.send('open-youtube-pane');
            }
        },
        {
            label: "Open Settings Panel",
            accelerator: "CmdOrCtrl+5",
            click: function () {
                win.webContents.send('open-settings-pane');
            }
        },
    ]
};
var mWord = {
    label: "Word Book",
    submenu: [{
            label: "Add Selected Text to Word Book",
            click: function () {
                win.webContents.send('add-selection-to-word-book');
            }
        },
        {
            label: "Annotate Selected Text for Automatic Notification",
            click: function () {
                win.webContents.send('annotate-selected-text');
            }
        },
        {
            label: "Annotate Searched Word with Selected Text in Web Search Panel",
            click: function () {
                win.webContents.send('annotate-from-web-pane');
            }
        },
        {
            type: "separator"
        },
        {
            label: "Copy Words to Clipboard",
            click: function () {
                win.webContents.send('copy-word-book');
            }
        },
        {
            label: "Reveal Word Book File in Finder",
            click: function () {
                win.webContents.send('reveal-work-book-in-finder');
            }
        },
    ]
};
var mYouTube = {
    label: "YouTube",
    enabled: false,
    submenu: [{
            label: "Reload YouTube Video",
            id: "youtube-0",
            enabled: false,
            click: function () {
                win.webContents.send('reload-youtube');
            }
        },
        {
            label: 'Copy YouTube Video URL',
            id: "youtube-1",
            enabled: false,
            click: function () {
                win.webContents.send('copy-youtube-url');
            }
        },
        {
            label: 'Open YouTube Video in Default Browser',
            id: "youtube-2",
            enabled: false,
            click: function () {
                win.webContents.send('open-youtube-in-default-browser');
            }
        },
        {
            label: 'Open YouTube Video in Side Panel',
            id: "youtube-3",
            enabled: false,
            click: function () {
                win.webContents.send('open-youtube-in-side-panel');
            }
        },
    ]
};
var mHelp = {
    role: 'help',
    submenu: [{
            label: 'Documentation',
            click: function () {
                //require('electron').shell.openItem(__dirname + '/assets/SourcePlayerDocumentation.pdf') }
                require('electron').shell.openExternal("https://circleapps.co/Source%20Player%20Documentation/Source%20Player%20Documentation.html");
            }
        },
        {
            label: 'Wiki',
            click: function () {
                //require('electron').shell.openItem(__dirname + '/assets/SourcePlayerDocumentation.pdf') }
                require('electron').shell.openExternal("https://github.com/circleapps/sourceplayer/wiki");
            }
        },
        {
            type: "separator"
        },
        {
            label: 'Privacy Policy',
            click: function () {
                require('electron').shell.openExternal("https://circleapps.co/privacy.txt");
            }
        },
        {
            label: 'Open Source Software License',
            click: function () {
                require('electron').shell.openExternal("https://github.com/circleapps/sourceplayer/wiki/Open-Source-Software-Attribution");
            }
        },
        {
            type: "separator"
        },
        {
            label: 'Email Feedback',
            click: function () {
                //require('electron').shell.openItem(__dirname + '/assets/SourcePlayerDocumentation.pdf') }
                //var body = "%0D%0A%0D%0A%0D%0A" + os.type() + "-" + os.platform() + "-" + os.release();
                var playerName;
                playerName = "Source Player";
                var address = "mailto:edwardweiliao@gmail.com?subject=Feedback for " + playerName;
                require('electron').shell.openExternal(address);
            }
        },
        {
            label: 'Reveal Log File',
            click: function () {
                win.webContents.send('reveal-log-file');
            }
        }
    ]
};
var template = [
    mApplication,
    mFile,
    mEdit,
    mPlayback,
    mLoop,
    mSubtitle,
    mView,
    mWord,
    mYouTube,
    mHelp,
];
// menu = Menu.buildFromTemplate(template);
//# sourceMappingURL=main.js.map