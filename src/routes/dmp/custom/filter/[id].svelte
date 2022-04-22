<script lang="ts">

    import {stepStore} from "../store";
    import {page} from "$app/stores";
    import {afterNavigate} from "$app/navigation";
    import {findStepColumns} from "../utils";
    import ConditionTree from "$lib/youi/condition/ConditionTree.svelte";

    let step = null;

    let columns = [];

    let children = [];

    const init = ()=>{
        step = $stepStore.filter(({id}) => $page.params.id == id)[0];
        columns = findStepColumns($stepStore,step);
        if(step && step.filters){
            children = step.filters;
        }
    };

    const handle_filter = ()=>{
        step = Object.assign(step,{filters:children});
        stepStore.updateStep(step);
    }

    afterNavigate(()=>{
        init();
    });

</script>

<ConditionTree {children} {columns} on:filter={handle_filter} class="flex-1" height={224}>
    <div slot="show" let:prop={show}>{show}</div>
</ConditionTree>
