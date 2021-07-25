<template>
    <div id="dev-tab">
        <h3>Development Tab!</h3>
        <progress-bar :percent="percent"></progress-bar>
    </div>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'
import ProgressBar from "./ProgressBar.vue";

@Component({
    components: {ProgressBar}
})
export default class DevTab extends Vue {
    public percent: number = 0.1;

    public async mounted() {
        setInterval(async () => {
            this.percent = 0.1;
            await this.sleep(400);
            this.percent = 0.3;
            await this.sleep(600);
            this.percent = 0.5;
            await this.sleep(800);
            this.percent = 0.8;
            await this.sleep(400);
            this.percent = 1;
        }, 3000);
    }

    private sleep(millis: long): Promise<void> {
        return new Promise(ff => {
            setTimeout(ff, millis);
        })
    }
}
</script>

<style scoped lang="scss">

</style>