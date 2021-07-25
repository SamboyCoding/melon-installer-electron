<template>
    <div id="app">
        <window-bar></window-bar>
        <img src="assets/ML_Logo.png" id="ml-logo" alt="MelonLoader Logo">
        <img src="assets/ML_Text.png" id="ml-text" alt="MelonLoader Text">
        <div id="main-content">
            <tab-bar :selected-tab="selectedTab" @set-tab="selectedTab = $event"></tab-bar>
            <div id="tab-content-wrapper">
                <component :is="selectedTab + '-tab'" :config="config"></component>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {Component, Vue} from 'vue-property-decorator';
import TabBar from "./components/TabBar.vue";
import WindowBar from "./components/WindowBar.vue";
import AutoTab from "./components/AutoTab.vue";
import SettingsTab from "./components/SettingsTab.vue";
import ManualTab from "./components/ManualTab.vue";
import IPC from "./IPC";
import InstallerConfig from "../common/InstallerConfig";
import DevTab from "./components/DevTab.vue";

@Component({
    components: {WindowBar, TabBar, AutoTab, ManualTab, SettingsTab, DevTab},
})
export default class App extends Vue {
    public selectedTab = 'auto';
    public config: InstallerConfig = null;

    public mounted() {
        IPC.onConfigUpdated = config => {
            console.info("Got config", config);
            this.config = config;
        };
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

* {
    box-sizing: border-box;
    user-select: none;
}

html, body, #app {
    margin: 0;
    padding: 0;
    font-family: "Roboto", sans-serif;
}

#app {

    #ml-logo {
        display: block;
        width: 128px;
        margin: 0 auto;
    }

    #ml-text {
        width: 460px;
        display: block;
        margin: 0 auto;
    }

    #main-content {
        margin: 1rem 1rem;

        #tab-content-wrapper {
            margin-top: 2px;
            border: 1px solid #555;
            height: 178px;
            padding: 4px;
            display: flex;
            flex-flow: column nowrap;
            position: relative;
            overflow: hidden;

            & > div {
                flex-grow: 1;
                width: calc(100% - 8px);
            }
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

    &:not([disabled]):hover {
        background: #aaa;
        color: black;
    }

    &[disabled] {
        cursor: not-allowed;
        background: #555;
        color: #777;
    }
}

select {
    outline: none;
    border: none;
    margin-left: 4px;
    padding: 4px 2px;
    color: #333;
}
</style>
