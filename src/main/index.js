"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
const { stat, readFile } = fs_1.promises;
let win;
async function createWindow() {
    console.log("[CreateWindow] Creating...");
    win = new electron_1.BrowserWindow({
        width: 480,
        height: 440,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        minWidth: 480,
        minHeight: 440,
        resizable: false,
        darkTheme: true,
        frame: false,
    });
    win.menuBarVisible = false;
    console.log("[CreateWindow] Loading file...");
    await win.loadFile("../../webContents/index.html");
    console.log("[CreateWindow] Done.");
}
electron_1.app.on("ready", async () => {
    await createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", async () => {
    if (win === null) {
        await createWindow();
    }
});
electron_1.ipcMain.on("browse-game-path", async (event) => {
    const result = await electron_1.dialog.showOpenDialog(win, {
        filters: [
            {
                name: "Game Executable",
                extensions: ["exe"]
            }
        ],
        properties: ["openFile"]
    });
    if (result.canceled)
        return;
    const gameExe = result.filePaths[0];
    const gameDir = path_1.dirname(gameExe);
    let installed = false;
    try {
        const mlDirStat = await stat(path_1.join(gameDir, "MelonLoader"));
        installed = mlDirStat.isDirectory();
    }
    catch (e) {
        //Ignore, probably dir doesn't exist
    }
    let arch;
    try {
        const binaryBytes = await readFile(gameExe);
        if (binaryBytes.length < 100) {
            console.error("[EXE Analyzer] File is less than 100 bytes??");
            return;
        }
        const peMachine = binaryBytes.readUInt16LE(binaryBytes.readInt32LE(60) + 4);
        console.log(`[EXE Analyzer] PE Machine is ${peMachine}`);
        arch = peMachine == 0x8664 ? "x64" : "x86";
    }
    catch (e) {
        console.error("[EXE Analyzer] Unable to get machine.");
        return;
    }
    event.sender.send("game-path-changed", gameDir, installed, arch);
});
//# sourceMappingURL=index.js.map