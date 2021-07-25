<template>
    <div class="progress-wrapper">
        <span class="progress-percent">{{ (percent * 100).toFixed(0) }}%</span>
        <div class="progress-inner" :style="{width: (percent * 100) + '%'}">

        </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'

@Component({})
export default class ProgressBar extends Vue {
    @Prop({
        type: () => Number
    })
    public percent: number;
}
</script>

<style scoped lang="scss">
.progress-wrapper {
    position: relative;
    background: #333;
    min-width: 150px;
    height: 32px;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;

    .progress-percent {
        z-index: 10;
        display: block;
        top: 0;
        left: 0;
        width: 100%;
        margin: auto 0;
        text-align: center;
    }

    .progress-inner {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0;
        transition: width 0.2s ease-out;
        will-change: width;
        background: #00B159;
    }
}
</style>