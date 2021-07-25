<template>
    <div id="window-bar">
        <div id="drag-region"></div>
        <div id="close-button" @click="close()">
            &times;
        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'

@Component({})
export default class WindowBar extends Vue {
    public close() {
        window.close();
    }
}
</script>

<style scoped lang="scss">
#window-bar {
    position: relative;
    width: 100%;
    height: 24px;
    border-top: 6px solid #00B159;

    #drag-region {
        position: absolute;
        top: 0;
        -webkit-app-region: drag;
        height: 24px;
        width: calc(100% - 32px);
        margin-right: 32px;
    }

    #close-button {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 22px;
        color: #ccc;
        user-select: none;
        padding: 0 8px 0 4px;

        &:hover {
            background: #222;
        }

        &:active {
            background: #333;
        }
    }

}
</style>