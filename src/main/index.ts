import {BrowserWindow, app, ipcMain, dialog, IpcMainEvent} from 'electron';
import {join, dirname} from "path";
import TOML, {AnyJson} from "@iarna/toml";
import InstallerConfig from "../common/InstallerConfig";
import Installer from "./installer";
import {promises} from "fs";

const {stat, readFile, writeFile, mkdtemp, rm} = promises;

let win: BrowserWindow;
const rootPath = process.env.APPDATA || process.env.HOME;
const configFilePath = join(rootPath, "MelonLoader.Installer.cfg");

const defaultConfig: InstallerConfig = {
    LastSelectedGamePath: "",
    RememberLastSelectedGame: false,
    CloseAfterCompletion: true,
    ShowAlphaPreReleases: false,
    AutoUpdateInstaller: true,
    HighlightLogFileLocation: false,
    Theme: 0
};

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

async function loadConfig() {
    let installerConfig = defaultConfig;

    try {
        const config = TOML.parse(await readFile(configFilePath, {encoding: "utf-8"}));

        installerConfig = config.Installer as object as InstallerConfig;
    } catch(e) {
        //Ignore
    }

    let ret = Object.assign({}, defaultConfig);
    return Object.assign(ret, installerConfig);
}

async function selectPath(gameExe: string) {
    const gameDir = dirname(gameExe);

    if(!await Installer.exists(gameDir))
        //Sanity check
        return;

    let installed = false;

    try {
        const mlDirStat = await stat(join(gameDir, "MelonLoader"));
        installed = mlDirStat.isDirectory();
    } catch (e) {
        //Ignore, probably dir doesn't exist
    }

    let arch: string;
    try {
        const binaryBytes = await readFile(gameExe);

        if (binaryBytes.length < 100) {
            console.error("[EXE Analyzer] File is less than 100 bytes??");
            return;
        }

        const peMachine = binaryBytes.readUInt16LE(binaryBytes.readInt32LE(60) + 4);

        console.log(`[EXE Analyzer] PE Machine is ${peMachine}`);

        arch = peMachine == 0x8664 ? "x64" : "x86";
    } catch (e) {
        console.error("[EXE Analyzer] Unable to get machine.");
        return;
    }

    win.webContents.send("game-path-changed", gameExe, installed, arch);
}

app.on("ready", async () => {
    await createWindow();

    loadConfig().then((config) => {
        win.webContents.send("config-updated", config);

        if(config.RememberLastSelectedGame && config.LastSelectedGamePath)
            selectPath(config.LastSelectedGamePath);
    })
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

ipcMain.on("save-config", async (event: IpcMainEvent, config: InstallerConfig) => {
    const toSave = TOML.stringify({Installer: config as object as AnyJson});

    await writeFile(configFilePath, toSave, {encoding: "utf-8"});

    event.sender.send("config-updated", config);
});

ipcMain.on("browse-zip-path", async (event: IpcMainEvent) => {
    const result = await dialog.showOpenDialog(win, {
        filters: [
            {
                name: "MelonLoader Archive",
                extensions: ["zip"]
            }
        ],
        properties: ["openFile"]
    });

    if (result.canceled)
        return;

    const zip = result.filePaths[0];

    event.sender.send("zip-path-changed", zip)
})

ipcMain.on("browse-game-path", async (event: IpcMainEvent) => {
    const result = await dialog.showOpenDialog(win, {
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

    await selectPath(gameExe);
});

ipcMain.on("uninstall", async (event: IpcMainEvent, path: string) => {
    path = dirname(path);

    await Installer.uninstall(path);

    event.sender.send("uninstall-complete");
});

ipcMain.on("install-auto", async (event: IpcMainEvent, path: string, version: string, arch: string) => {
    path = dirname(path);

    const localTempDir = await mkdtemp("ml-installer-electron-");

    const localZip = join(localTempDir, "auto-install.zip");

    let success = false;

    while (!success) {
        await Installer.download(`https://github.com/LavaGang/MelonLoader/releases/download/${version}/MelonLoader.${arch}.zip`, localZip, percent => {
            event.sender.send("auto-install-download-percent", percent);
        });

        const sha512 = await Installer.downloadString(`https://github.com/LavaGang/MelonLoader/releases/download/${version}/MelonLoader.${arch}.sha512`);

        success = await Installer.validateSha512(localZip, sha512)
    }

    await Installer.installZip(path, localZip);

    await rm(localTempDir, {recursive: true, force: true});

    console.log("[AutoInstall] Cleaned up temp dir");

    event.sender.send("install-complete");
});

ipcMain.on("install-manual", async (event: IpcMainEvent, gamePath: string, zipPath: string) => {
    gamePath = dirname(gamePath);

    await Installer.installZip(gamePath, zipPath);

    event.sender.send("install-complete");
})