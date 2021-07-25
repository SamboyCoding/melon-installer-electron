<template>
    <div id="settings-tab">
        <div class="row">
            <span>Theme:</span>
            <select disabled v-model="theme">
                <option value="0">Dark</option>
                <option value="1">Light</option>
            </select>
        </div>
        <div class="row">
            <custom-checkbox label="Auto-Update Installer" :checked="config.AutoUpdateInstaller" @toggled="autoUpdate = !config.AutoUpdateInstaller"></custom-checkbox>
        </div>
        <div class="row grow">
            <custom-checkbox label="Close After Completion" :checked="config.CloseAfterCompletion" @toggled="closeDone = !config.CloseAfterCompletion"></custom-checkbox>
            <custom-checkbox label="Highlight Log File Location" :checked="config.HighlightLogFileLocation" @toggled="highlightLog = !config.HighlightLogFileLocation"></custom-checkbox>
        </div>
        <div class="row grow">
            <custom-checkbox label="Show ALPHA Pre-Releases" :checked="config.ShowAlphaPreReleases" @toggled="showAlpha = !config.ShowAlphaPreReleases"></custom-checkbox>
            <custom-checkbox label="Remember Last Selected Game" :checked="config.RememberLastSelectedGame" @toggled="rememberGame = !config.RememberLastSelectedGame"></custom-checkbox>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import InstallerConfig from "../../common/InstallerConfig";
import CustomCheckbox from "./CustomCheckbox.vue";
import IPC from "../IPC";

@Component({
    components: {CustomCheckbox}
})
export default class SettingsTab extends Vue {
    @Prop()
    public config: InstallerConfig;

    get theme(): number {
        // return this.config.Theme;
        return 0; //Dark
    }

    set theme(value: string) {
        this.modifyAndSaveConfig(c => c.Theme = Number(value));
    }

    set autoUpdate(value: boolean) {
        this.modifyAndSaveConfig(c => c.AutoUpdateInstaller = value);
    }

    set closeDone(value: boolean) {
        this.modifyAndSaveConfig(c => c.CloseAfterCompletion = value);
    }

    set highlightLog(value: boolean) {
        this.modifyAndSaveConfig(c => c.HighlightLogFileLocation = value);
    }

    set showAlpha(value: boolean) {
        this.modifyAndSaveConfig(c => c.ShowAlphaPreReleases = value);
    }

    set rememberGame(value: boolean) {
        this.modifyAndSaveConfig(c => c.RememberLastSelectedGame = value);
    }

    private modifyAndSaveConfig(modifier: (config: InstallerConfig) => void) {
        IPC.changeAndSaveConfig(modifier, this.config);
    }
}
</script>

<style scoped lang="scss">
#settings-tab {
    color: #bbb;
    font-size: 14px;
    margin-top: 4px;
    margin-left: 4px;
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    position: relative;
    justify-content: space-around;

    .row {
        display: flex;
        flex-flow: row nowrap;
        vertical-align: baseline;
        margin: 0 auto;
        white-space: nowrap;
        align-items: center;
        justify-content: center;
        width: 100%;

        &.grow * {
            flex-basis: 2px;
            flex-grow: 1;
        }
    }

    select {
        margin-left: 16px;
    }
}
</style>