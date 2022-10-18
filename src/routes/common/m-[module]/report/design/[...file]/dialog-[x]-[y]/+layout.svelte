<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {page} from "$app/stores";

    import TooltipPage from "$lib/component/page/TooltipPage.svelte";

    export let x = 100;

    export let y = 100;

    let open = false;

    afterNavigate(()=>{
        open = true;
        x = +$page.params.x;
        y = +$page.params.y;
    });

</script>

<TooltipPage {x} {y} bind:open>
    <slot>

    </slot>
</TooltipPage>

