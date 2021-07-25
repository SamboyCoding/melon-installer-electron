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
            <select :disabled="useLatest" style="width: 100px" v-model="selectedVersion">
                <option v-for="version in mlVersions">{{version.tag_name}}</option>
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
            <button class="install-button" v-if="alreadyInstalled">UPDATE</button>
            <button class="install-button" v-if="alreadyInstalled">UN-INSTALL</button>
            <button class="install-button" v-if="!alreadyInstalled">INSTALL</button>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'
import CustomCheckbox from "./CustomCheckbox.vue";
import IPC from "../IPC";
import axios from "axios";

@Component({
    components: {CustomCheckbox}
})
export default class AutoTab extends Vue {
    //UI Props
    public showPreRelease: boolean = false;
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

    public async mounted() {
        IPC.onGamePathChanged = (newPath, newAlreadyInstalled, arch) => {
            console.info(`[Auto] Received new game path ${newPath}, is installed: ${newAlreadyInstalled}, arch: ${arch}`);
            this.gamePath = newPath;
            this.alreadyInstalled = newAlreadyInstalled;
            this.gameIs64Bit = arch == "x64";
        }

        try {
            const response = await axios.get("https://api.github.com/repos/lavagang/melonloader/releases");
            let versions = response.data as any[];

            if (!this.showPreRelease)
                versions = versions.filter(v => v.prerelease === false);

            this.mlVersions = versions;
        } catch(e) {
            alert("Failed to get list of releases! " + e);
        }
    }

    public doSelectPath() {
        IPC.browseForGamePath();
    }

    public toggleAutoArch() {
        this.useAutoArch = !this.useAutoArch;

        if(this.useAutoArch)
            this.selectedArch = this.gameIs64Bit ? "x64" : "x86";
    }

    public toggleUseLatest() {
        this.useLatest = !this.useLatest;

        if(this.useLatest)
            this.selectedVersion = this.mlVersions[0];
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

            & {
                margin-right: 6px;
            }
        }
    }

    button {
        background: #222;
        color: #ccc;
        border: 1px solid #555;
        cursor: pointer;
        font-size: 11px;
        font-weight: bold;

        &:hover {
            background: #aaa;
            color: black;
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

    select {
        outline: none;
        border: none;
        margin-left: 4px;
        padding: 4px 2px;
        color: #333;
    }
}
</style>