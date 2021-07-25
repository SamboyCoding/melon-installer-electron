import {ipcRenderer, IpcRendererEvent} from "electron";
import InstallerConfig from "../common/InstallerConfig";

export default class IPC {
    public static onGamePathChanged: (path: string, alreadyInstalled: boolean, arch: string) => void
        = () => null;

    public static onZipPathChanged: (path: string) => void
        = () => null;

    public static onConfigUpdated: (config: InstallerConfig) => void
        = () => null;

    public static browseForGamePath() {
        ipcRenderer.send("browse-game-path");
    }

    public static browseForZipArchive() {
        ipcRenderer.send("browse-zip-path");
    }

    public static saveConfig(config: InstallerConfig) {
        ipcRenderer.send("save-config", config);
    }

    public static changeAndSaveConfig(modifier: (config: InstallerConfig) => void, config: InstallerConfig) {
        let newConfig = Object.assign({}, config) as InstallerConfig;

        modifier(newConfig);

        IPC.saveConfig(newConfig);
    }
}

ipcRenderer.on("game-path-changed", (event: IpcRendererEvent, path: string, alreadyInstalled: boolean, arch: string) => {
    IPC.onGamePathChanged(path, alreadyInstalled, arch);
});

ipcRenderer.on("zip-path-changed", (event: IpcRendererEvent, path: string) => {
    IPC.onZipPathChanged(path);
});

ipcRenderer.on("config-updated", (event: IpcRendererEvent, config: InstallerConfig) => {
    IPC.onConfigUpdated(config);
})