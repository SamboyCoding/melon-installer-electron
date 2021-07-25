<template>
    <div id="manual-tab">
        <br>
        <div class="row">
            <span>Unity Game:</span>
            <button id="manual-select-game-button" @click="doSelectGamePath()">SELECT</button>
            <span id="manual-game-path">{{ gamePath ? gamePath : "Please select your unity game..." }}</span>
        </div>
        <br><br>
        <div class="row">
            <span>Zip Archive:</span>
            <button id="manual-select-zip-button" @click="doSelectZipPath()">SELECT</button>
            <span id="manual-zip-path">{{ zipPath ? zipPath : "Please select your MelonLoader Zip Archive..." }}</span>
        </div>
        <div class="row grow" id="install-buttons">
            <button class="install-button" v-if="alreadyInstalled" :disabled="cannotInstall">RE-INSTALL</button>
            <button class="install-button" v-if="alreadyInstalled" :disabled="!gamePath">UN-INSTALL</button>
            <button class="install-button" v-if="!alreadyInstalled" :disabled="cannotInstall">INSTALL</button>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import IPC from "../IPC";
import InstallerConfig from "../../common/InstallerConfig";

@Component({})
export default class ManualTab extends Vue {
    @Prop({
    })
    public config: InstallerConfig;

    public gamePath?: string = null;
    public zipPath?: string = null;
    public alreadyInstalled: boolean = false;

    public mounted() {
        IPC.onGamePathChanged = (newPath, newAlreadyInstalled, _) => {
            console.info(`[Manual] Received new game path ${newPath}, is installed: ${newAlreadyInstalled}`);
            this.gamePath = newPath;
            this.alreadyInstalled = newAlreadyInstalled;

            this.modifyAndSaveConfig(config => config.LastSelectedGamePath = this.gamePath);
        }

        IPC.onZipPathChanged = (newPath) => {
            console.info(`[Manual] Received new Zip path ${newPath}`);
            this.zipPath = newPath;
        }
    }

    public doSelectGamePath() {
        IPC.browseForGamePath();
    }

    public doSelectZipPath() {
        IPC.browseForZipArchive();
    }

    get cannotInstall(): boolean {
        return !this.gamePath || !this.zipPath;
    }

    private modifyAndSaveConfig(modifier: (config: InstallerConfig) => void) {
        IPC.changeAndSaveConfig(modifier, this.config);
    }
}
</script>

<style scoped lang="scss">
#manual-tab {
    color: #bbb;
    font-size: 14px;
    margin-top: 4px;
    margin-left: 4px;
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    position: relative;

    .row {
        display: flex;
        flex-flow: row nowrap;
        vertical-align: baseline;
        margin: 0 auto;
        white-space: nowrap;
        align-items: center;
        justify-content: center;
        width: 90%;

        &.grow * {
            flex-basis: 2px;
            flex-grow: 1;
        }
    }

    #install-buttons {
        position: relative;
        border-top: 1px solid #777;
        width: 95%;
        padding-top: 0.5rem;
        margin: 16px auto 0;
        flex-grow: 1;

        button {
            height: 100%;

            & {
                margin-right: 6px;
            }
        }
    }

    #manual-select-game-button, #manual-select-zip-button {
        margin: 0 8px;
        padding: 2px 10px;
    }

    #manual-zip-path, #manual-game-path {
        display: block;
        flex-grow: 1;
        font-size: 11px;
        overflow: hidden;
        white-space: nowrap;
        align-self: center;
    }
}
</style>