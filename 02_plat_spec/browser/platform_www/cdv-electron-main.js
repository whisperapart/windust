/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs');
const path = require('path');
const { cordova } = require('./package.json');
// Module to control application life, browser window and tray.
const {
    app,
    BrowserWindow,
    protocol,
    ipcMain,
    menu,
    screen
} = require('electron');

// Electron settings from .json file.
const cdvElectronSettings = require('./cdv-electron-settings.json');
const reservedScheme = require('./cdv-reserved-scheme.json');

const devTools = cdvElectronSettings.browserWindow.webPreferences.devTools
    ? require('electron-devtools-installer')
    : false;

const scheme = cdvElectronSettings.scheme;
const hostname = cdvElectronSettings.hostname;
const isFileProtocol = scheme === 'file';
const pathToSettings = app.getPath('userData') + '/game.ini';
// const Store = require('electron-store');
// const store = new Store();

/**
 * The base url path.
 * E.g:
 * When scheme is defined as "file" the base path is "file://path-to-the-app-root-directory"
 * When scheme is anything except "file", for example "app", the base path will be "app://localhost"
 *  The hostname "localhost" can be changed but only set when scheme is not "file"
 */
const basePath = (() => isFileProtocol ? `file://${__dirname}` : `${scheme}://${hostname}`)();

if (reservedScheme.includes(scheme)) throw new Error(`The scheme "${scheme}" can not be registered. Please use a non-reserved scheme.`);

if (!isFileProtocol) {
    protocol.registerSchemesAsPrivileged([
        { scheme, privileges: { standard: true, secure: true } }
    ]);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    let appIcon;
    if (fs.existsSync(path.join(__dirname, 'img/app.png'))) {
        appIcon = path.join(__dirname, 'img/app.png');
    } else if (fs.existsSync(path.join(__dirname, 'img/icon.png'))) {
        appIcon = path.join(__dirname, 'img/icon.png');
    } else {
        appIcon = path.join(__dirname, 'img/logo.png');
    }

    const browserWindowOpts = Object.assign({}, cdvElectronSettings.browserWindow, { icon: appIcon });
    browserWindowOpts.webPreferences.preload = path.join(app.getAppPath(), 'cdv-electron-preload.js');
    browserWindowOpts.webPreferences.contextIsolation = true;


    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    intRes = resolutionConfigLoad();
    switch (intRes){
        case 1:
            browserWindowOpts.width = 800;
            browserWindowOpts.height = 600;
            browserWindowOpts.fullscreen = false;
            break;
        case 2:
            browserWindowOpts.width = 1200;
            browserWindowOpts.height = 750;
            browserWindowOpts.fullscreen = false;
            break;
        case 3:
            browserWindowOpts.width = 1600;
            browserWindowOpts.height = 1000;
            browserWindowOpts.fullscreen = false;
            break;
        case 9:
            browserWindowOpts.width = width;
            browserWindowOpts.height = height;
            browserWindowOpts.fullscreen = false;
            break;
        default:
            browserWindowOpts.width = width;
            browserWindowOpts.height = height;
            browserWindowOpts.fullscreen = true;
            break;
    }

    browserWindowOpts.minWidth = 800;
    browserWindowOpts.minHeight = 600;
    browserWindowOpts.center = true;
    browserWindowOpts.frame = true;
    browserWindowOpts.autoHideMenuBar = true;
    browserWindowOpts.menuBarVisible = false;

    browserWindowOpts.show = false;
    browserWindowOpts.fullscreenable = true;
    browserWindowOpts.titlestring = 'wind and dust';
    // browserWindowOpts.titleBarStyle ='hidden';

    mainWindow = new BrowserWindow(browserWindowOpts);
    // Load a local HTML file or a remote URL.
    const cdvUrl = cdvElectronSettings.browserWindowInstance.loadURL.url;
    const loadUrl = cdvUrl.includes('://') ? cdvUrl : `${basePath}/${cdvUrl}`;
    const loadUrlOpts = Object.assign({}, cdvElectronSettings.browserWindowInstance.loadURL.options);

    mainWindow.loadURL(loadUrl, loadUrlOpts);
    mainWindow.setMenu(null);
    mainWindow.setBackgroundColor('rgb(255, 145, 145)');
    mainWindow.setTitle("Wind and Dust");
    mainWindow.setMovable(true);

    ipcMain.on('set-resolution', (event, intRes) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)

        onResolutionHandler(win,intRes);
    })

    // Open the DevTools.
    if (cdvElectronSettings.browserWindow.webPreferences.devTools) {
        mainWindow.webContents.openDevTools();
        // console.log(cdvElectronSettings.browserWindow.webPreferences.devTools);
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        let intRes = resolutionConfigLoad();
        onResolutionHandler(mainWindow,intRes);
        mainWindow.show();
    });
    mainWindow.on('leave-full-screen',()=>{
        // let intRes = store.get('resolutionV');
        let intRes = resolutionConfigLoad();
        switch (intRes){
            case 1:
                mainWindow.unmaximize();
                mainWindow.setSize(800,600);
                mainWindow.center();
                break;
            case 2:
                mainWindow.unmaximize();
                mainWindow.setSize(1200,750);
                mainWindow.center();
                break;
            case 3:
                mainWindow.unmaximize();
                mainWindow.setSize(1600,1000);
                mainWindow.center();
                break;
            case 9:
                mainWindow.maximize();
                mainWindow.center();
                break;
            default:
                break;
        }
    });
}

function configureProtocol () {
    protocol.registerFileProtocol(scheme, (request, cb) => {
        const url = request.url.substr(basePath.length + 1);
        cb({ path: path.normalize(path.join(__dirname, url)) }); // eslint-disable-line node/no-callback-literal
    });

    protocol.interceptFileProtocol('file', (_, cb) => { cb(null); });
}

function resolutionConfigSave(intV){
    fs.writeFileSync(pathToSettings,intV+"");
    console.log("write to "+pathToSettings);
}
function resolutionConfigLoad(){
    let intV = 0;
    try{
        intV = fs.readFileSync(pathToSettings,{"encoding":"utf-8"});
        intV = parseInt(intV);
    }catch (e) {
        // do nothing. file not exists
        console.log("read failed");
        console.log(e);
    }
    return intV;
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    if (!isFileProtocol) {
        configureProtocol();
    }

    if (devTools && cdvElectronSettings.devToolsExtension) {
        const extensions = cdvElectronSettings.devToolsExtension.map(id => devTools[id] || id);
        devTools.default(extensions) // default = install extension
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    }

    createWindow();
    // let intRes = store.get('resolutionV');
    // let intRes = resolutionConfigLoad();
    // console.log("load screen resolution config="+intRes);
    // onResolutionHandler(mainWindow,intRes);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        if (!isFileProtocol) {
            configureProtocol();
        }

        createWindow();
        // let intRes = store.get('resolutionV');
        // let intRes = resolutionConfigLoad();
        // console.log("load screen resolution config="+intRes);
        // onResolutionHandler(mainWindow,intRes);
    }
});

ipcMain.handle('cdv-plugin-exec', async (_, serviceName, action, ...args) => {
    if (cordova && cordova.services && cordova.services[serviceName]) {
        const plugin = require(cordova.services[serviceName]);

        return plugin[action]
            ? plugin[action](args)
            : Promise.reject(new Error(`The action "${action}" for the requested plugin service "${serviceName}" does not exist.`));
    } else {
        return Promise.reject(new Error(`The requested plugin service "${serviceName}" does not exist have native support.`));
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function getResolution(){
    // const { screen } = require('electron');
    const disArr = screen.getAllDisplays();
    for(let i=0;i<disArr.length;i++){
        console.log(disArr[i].size);
    }
}

function onResolutionHandler(win,intV){
    switch (intV){
        case 1:
            // store.set('resolutionV',1);
            resolutionConfigSave(1);
            if(win.isFullScreen()){
                win.setFullScreen(false);
            }else{
                mainWindow.unmaximize();
                mainWindow.setSize(800,600);
                mainWindow.center();
            }
            break;
        case 2:
            // store.set('resolutionV',2);
            resolutionConfigSave(2);
            if(win.isFullScreen()) {
                win.setFullScreen(false);
            }else{
                mainWindow.unmaximize();
                mainWindow.setSize(1200,750);
                mainWindow.center();
            }
            break;
        case 3:
            // store.set('resolutionV',intV);
            resolutionConfigSave(3);
            if(win.isFullScreen()) {
                win.setFullScreen(false);
            }else{
                mainWindow.unmaximize();
                mainWindow.setSize(1600,1000);
                mainWindow.center();
            }
            break;
        case 9:
            // store.set('resolutionV',intV);
            resolutionConfigSave(9);
            if(win.isFullScreen()) {
                win.setFullScreen(false);
            }else{
                mainWindow.maximize();
                mainWindow.center();
            }
            break;
        default:
            // store.set('resolutionV',0);
            resolutionConfigSave(0);
            if(win.isFullScreen()) break;
            win.setFullScreen(true);
            win.center();
            break;
    }
}