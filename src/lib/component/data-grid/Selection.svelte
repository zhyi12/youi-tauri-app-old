<script lang="ts">

    import Box from "./Box.svelte";
    import {toPixel} from "../../youi";

    export let selectionBoxes = [];

    export let x = 0;
    export let y = 0;

</script>

<div class="selection-boxes">
    <div style={'transform:translate('+toPixel(x*-1)+', '+toPixel(y*-1)+');'}>
        {#each selectionBoxes as box}
            <Box {...box}></Box>
        {/each}
    </div>
</div>

<style>
    .selection-boxes{
        pointer-events: none;
        position: absolute;
        overflow:hidden;
        top:0px;
        left:0px;
        right:0px;
        bottom:0px;
    }
</style>