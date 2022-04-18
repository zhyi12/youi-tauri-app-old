<script lang="ts">

    import {stepStore} from "../store";
    import {page} from "$app/stores";
    import {findStepColumns} from "../utils";
    import ConditionTree from "$lib/youi/condition/ConditionTree.svelte";

    let step = null;

    let columns = [];

    let children = [];

    stepStore.subscribe((steps)=>{
        let first = !step;
        step = steps.filter(({id}) => $page.params.id == id)[0];
        columns = findStepColumns(steps,step);
        if(first){
            children = step.filters;
        }
    })

    const handle_filter = ()=>{
        step = Object.assign(step,{filters:children});
        stepStore.updateStep(step);
    }
</script>

<ConditionTree {children} {columns} on:filter={handle_filter} class="flex-1">
    <div slot="show" let:prop={show}>{show}</div>
</ConditionTree>
