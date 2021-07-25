<template>
    <div class="custom-checkbox" @click="$emit('toggled')">
        <div class="outer-check">
            <div class="inner-check" :style="{display: checked ? 'block' : 'none'}"></div>
        </div>
        <span>{{label}}</span>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'

@Component({})
export default class CustomCheckbox extends Vue {
    @Prop({
        type: () => Boolean
    })
    public checked: boolean;

    @Prop({
        type: () => String
    })
    public label: string;
}
</script>

<style scoped lang="scss">

$outerWidth: 13px;

.custom-checkbox {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-left: 8px;
    color: #aaa;
    font-size: 12px;
    cursor: pointer;

    .outer-check {
        display: inline-block;
        width: $outerWidth;
        height: $outerWidth;
        border: 1px solid #ccc;

        .inner-check {
            margin: 1px;
            width: $outerWidth - 4; //1px padding each size, 1px gap each side
            height: $outerWidth - 4;
            background: #00B159;
        }
    }

    span {
        margin-left: 4px;
    }
}
</style>