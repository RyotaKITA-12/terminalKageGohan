import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { baseUrl } from "./context";


let rendererWindow: BrowserWindow;

const createRendererWindow = () => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    rendererWindow = new BrowserWindow({
        width: width / 2,
        height: height / 2,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false,
        },
    });
    rendererWindow.removeMenu();
    void rendererWindow.loadURL(`${baseUrl}?renderer`);

    if (!app.isPackaged) {
        rendererWindow.webContents.openDevTools();
    }
};


ipcMain.handle('exec_command', async (event, data) => {
    try {
        var sudo = require("sudo-prompt")
        var options = {
            name: "Electron",
        };
        sudo.exec(data, options, function(error, stdout) {
            if (error) throw error;
        });
        return data;
    } catch (e) {
        return "failed.";
    }
})

ipcMain.handle('load_template', async (event, data) => {
    const command = 'term_template=`cat ./electron/data/' + data + '.terminal`;plutil -insert "Window Settings.' + data + '" -xml "$term_template" ~/Library/Preferences/com.apple.Terminal.plist; defaults write com.apple.Terminal "Default Window Settings" ' + data + ';defaults write com.apple.Terminal "Startup Window Settings" ' + data
    try {
        var sudo = require("sudo-prompt")
        var options = {
            name: "Electron",
        };
        sudo.exec(command, options, function(error, stdout) {
            if (error) throw error;
        });
        return command;
    } catch (e) {
        return "failed.";
    }
})

ipcMain.handle('update_prompt', async (event, data) => {
    const command = 'TKG_START_LINE="$((`sed -n ' + "'/Start: Terminal Kake Gohan/=' ~/.zshrc`-1))" + '";TKG_END_LINE="$((`sed -n ' + "'/End  : Terminal Kake Gohan/=' ~/.zshrc`+1))" + '";sed "$TKG_START_LINE,$((TKG_END_LINE))d" ~/.zshrc > ~/.tmp_zshrc_tkg;mv -f ~/.tmp_zshrc_tkg ~/.zshrc;rm -f ~/.tmp_zshrc_tkg;echo '+ "'\n#** -- Start: Terminal Kake Gohan -> **#\n\nPROMPT=" + '"' + data + '"\n\n#** <- End  : Terminal Kake Gohan -- **#\n' + "' >> ~/.zshrc"
    try {
        var sudo = require("sudo-prompt")
        var options = {
            name: "Electron",
        };
        sudo.exec(command, options, function(error, stdout) {
            if (error) throw error;
        });
        return command;
    } catch (e) {
        return e;
    }
})

export { createRendererWindow, };

