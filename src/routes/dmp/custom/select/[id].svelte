<script lang="ts">
    import List from "$lib/youi/list/List.svelte";
    import {page} from '$app/stores';
    import {stepStore} from "../store";

    let step = $stepStore.filter(({id})=>$page.params.id==id)[0];

    const handle_select = ()=>{
        stepStore.updateStep(step);
    }

</script>

<List bind:items={step.columns} bind:selectedIds={step.selectedColumnNames} on:select={handle_select}>

</List>


