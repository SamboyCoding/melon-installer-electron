import {BrowserWindow, app, ipcMain, dialog} from 'electron';
import {promises} from "fs";
import {join, dirname} from "path";

const {stat, readFile} = promises;

let win: BrowserWindow;

async function createWindow() {
    console.log("[CreateWindow] Creating...");

    win = new BrowserWindow({
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

    await win.loadFile("../../webContents/index.html")

    console.log("[CreateWindow] Done.");
}

app.on("ready", async () => {
    await createWindow();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", async () => {
    if (win === null) {
        await createWindow();
    }
});

ipcMain.on("browse-game-path", async (event) => {
    const result = await dialog.showOpenDialog(win, {
        filters: [
            {
                name: "Game Executable",
                extensions: ["exe"]
            }
        ],
        properties: ["openFile"]
    });

    if(result.canceled)
        return;

    const gameExe = result.filePaths[0];

    const gameDir = dirname(gameExe);

    let installed = false;

    try {
        const mlDirStat = await stat(join(gameDir, "MelonLoader"));
        installed = mlDirStat.isDirectory();
    } catch(e) {
        //Ignore, probably dir doesn't exist
    }

    let arch: string;
    try {
        const binaryBytes = await readFile(gameExe);

        if(binaryBytes.length < 100) {
            console.error("[EXE Analyzer] File is less than 100 bytes??");
            return;
        }

        const peMachine = binaryBytes.readUInt16LE(binaryBytes.readInt32LE(60) + 4);

        console.log(`[EXE Analyzer] PE Machine is ${peMachine}`);

        arch = peMachine == 0x8664 ? "x64" : "x86";
    } catch(e) {
        console.error("[EXE Analyzer] Unable to get machine.");
        return;
    }

    event.sender.send("game-path-changed", gameDir, installed, arch);
});
