<template>
    <div id="tab-bar">
        <div v-for="(displayName, key) in tabs" :id="'tab-' + key" :class="{selected: selectedTab === key}" @click="setTab(key)">
            {{ displayName }}
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'

@Component({})
export default class TabBar extends Vue {
    @Prop({
        type: () => String
    })
    public selectedTab: string;

    public tabs = {
        auto: "Automated",
        manual: "Manual Zip",
        settings: "Settings",
        // dev: "Dev"
    }

    public setTab(name: string) {
        this.$emit("set-tab", name);
    }
}
</script>

<style scoped lang="scss">
#tab-bar {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;

    div {
        flex-basis: 20%;
        flex-grow: 1;
        text-align: center;
        font-weight: bold;
        color: #ccc;
        padding: 4px 0;
        font-size: 15px;
        border-bottom: 3px solid #444;
        cursor: pointer;

        &:hover {
            background: #222;
        }

        &.selected {
            border-bottom: 3px solid crimson;
        }
    }
}
</style>