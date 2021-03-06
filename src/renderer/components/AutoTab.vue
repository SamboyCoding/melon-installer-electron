<template>
    <div id="auto-tab">
        <div class="row">
            <span>Unity Game:</span>
            <button id="select-button" @click="doSelectPath()">SELECT</button>
            <span id="game-path">{{ gamePath ? gamePath : "Not Set" }}</span>
        </div>
        <br>
        <div class="row">
            <span>Version:</span>
            <select disabled v-if="!mlVersions.length" style="width: 100px">
                <option>Loading...</option>
            </select>
            <select v-else :disabled="useLatest" style="width: 100px" v-model="selectedVersion">
                <option v-for="version in mlVersions">{{ version.tag_name }}</option>
            </select>
            <custom-checkbox :checked="useLatest" label="Latest" @toggled="toggleUseLatest()"></custom-checkbox>
        </div>
        <br>
        <div class="row">
            <span>Game Arch:</span>
            <select :disabled="useAutoArch" v-model="selectedArch">
                <option>x86</option>
                <option>x64</option>
            </select>
            <custom-checkbox :checked="useAutoArch" label="Auto-Detect" @toggled="toggleAutoArch()"></custom-checkbox>
        </div>
        <div class="row grow" id="install-buttons">
            <progress-bar v-if="currentlyInstalling" :percent="installPercent"></progress-bar>
            <button class="install-button" v-if="alreadyInstalled && !currentlyInstalling" :disabled="cannotInstall" @click="install()">UPDATE</button>
            <button class="install-button" v-if="alreadyInstalled && !currentlyInstalling" :disabled="cannotInstall" @click="uninstall()">UN-INSTALL</button>
            <button class="install-button" v-if="!alreadyInstalled && !currentlyInstalling" :disabled="cannotInstall" @click="install()">INSTALL</button>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import CustomCheckbox from "./CustomCheckbox.vue";
import IPC from "../IPC";
import axios from "axios";
import InstallerConfig from "../../common/InstallerConfig";
import ProgressBar from "./ProgressBar.vue";

@Component({
    components: {ProgressBar, CustomCheckbox}
})
export default class AutoTab extends Vue {
    @Prop({
    })
    public config: InstallerConfig;

    //UI Props
    public useLatest: boolean = true;
    public useAutoArch: boolean = true;
    public selectedArch: string = "x64";
    public selectedVersion: string = "v0.4.3";

    //Game Props
    public gamePath?: string = null;
    public gameIs64Bit: boolean = true;
    public alreadyInstalled: boolean = false;

    //Fetched from web
    public mlVersions: any[] = [];

    public currentlyInstalling: boolean = false;
    public installPercent: number = 0;

    public async mounted() {
        IPC.onGamePathChanged = (newPath, newAlreadyInstalled, arch) => {
            console.info(`[Auto] Received new game path ${newPath}, is installed: ${newAlreadyInstalled}, arch: ${arch}`);
            this.gamePath = newPath;
            this.alreadyInstalled = newAlreadyInstalled;
            this.gameIs64Bit = arch == "x64";

            this.modifyAndSaveConfig(config => config.LastSelectedGamePath = this.gamePath);
        };

        IPC.onAutoInstallDownloadPercent = (percent) => {
            this.installPercent = percent * 0.9; //Cap to 90% to leave room for installing.
        };

        IPC.onInstallComplete = () => {
            alert("INSTALL was successful!");
            this.currentlyInstalling = false;
            this.installPercent = 0;
            this.alreadyInstalled = true;

            if(this.config.CloseAfterCompletion)
                window.close();
        };

        IPC.onUninstallComplete = () => {
            this.alreadyInstalled = false;
            alert("UNINSTALL was successful!");
        };

        await this.refreshReleases();
    }

    private async refreshReleases() {
        if(!this.config) {
            setTimeout(this.refreshReleases, 200);
            return;
        }

        try {
            const response = await axios.get(`https://api.github.com/repos/lavagang/melonloader/releases`);
            let versions = response.data as any[];

            if (!this.config.ShowAlphaPreReleases)
                versions = versions.filter(v => v.prerelease === false);

            this.mlVersions = versions;
            this.selectedVersion = this.mlVersions[0].tag_name;
        } catch (e) {
            alert("Failed to get list of releases! " + e);
        }
    }

    public doSelectPath() {
        IPC.browseForGamePath();
    }

    public toggleAutoArch() {
        this.useAutoArch = !this.useAutoArch;

        if (this.useAutoArch)
            this.selectedArch = this.gameIs64Bit ? "x64" : "x86";
    }

    public toggleUseLatest() {
        this.useLatest = !this.useLatest;

        if (this.useLatest)
            this.selectedVersion = this.mlVersions[0].tag_name;
    }

    public install() {
        this.currentlyInstalling = true;
        IPC.installAuto(this.gamePath, this.selectedVersion, this.selectedArch);
    }

    public uninstall() {
        IPC.uninstall(this.gamePath);
    }

    get cannotInstall(): boolean {
        return !this.gamePath;
    }

    private modifyAndSaveConfig(modifier: (config: InstallerConfig) => void) {
        IPC.changeAndSaveConfig(modifier, this.config);
    }
}
</script>

<style scoped lang="scss">
#auto-tab {
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

        &.grow * {
            flex-basis: 2px;
            flex-grow: 1;
        }
    }

    #install-buttons {
        position: relative;
        border-top: 1px solid #777;
        width: 100%;
        padding-top: 0.5rem;
        margin-top: 8px;
        flex-grow: 1;

        button {
            height: 100%;

            &:not(:last-of-type) {
                margin-right: 6px;
            }
        }
    }

    #select-button {
        margin: 0 8px;
        padding: 2px 10px;
    }

    #game-path {
        font-size: 11px;
        overflow: hidden;
        white-space: nowrap;
        align-self: center;
    }


}
</style>