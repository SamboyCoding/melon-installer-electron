import {ipcRenderer, IpcRendererEvent} from "electron";

export default class IPC {
    public static onGamePathChanged: (path: string, alreadyInstalled: boolean, arch: string) => void
        = () => null;

    public static browseForGamePath() {
        ipcRenderer.send("browse-game-path");
    }
}

ipcRenderer.on("game-path-changed", (event: IpcRendererEvent, path: string, alreadyInstalled: boolean, arch: string) => {
    IPC.onGamePathChanged(path, alreadyInstalled, arch);
});