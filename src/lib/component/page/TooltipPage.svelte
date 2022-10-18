<script lang="ts">
    import {Tooltip,toPixel} from "../../youi/index";

    export let x = 0;
    export let y = 0;

    export let open = true;

    $:direction = y>500?'top':'bottom';

</script>

<div class="page-tooltip" style:left={toPixel(x)} style:top={toPixel(y)}>
    <Tooltip {direction} bind:open hideIcon={true}>
        <div class="page-tooltip-content">
            <slot>
            </slot>
        </div>
    </Tooltip>
</div>

<style lang="scss">
    .page-tooltip{
      position: absolute;
      .page-tooltip-content{
        background-color: #f9f9f9;
        padding:8px;
        width:500px;
        height:400px;
      }
    }
</style>