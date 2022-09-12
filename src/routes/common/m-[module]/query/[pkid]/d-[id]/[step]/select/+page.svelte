<script lang="ts">

    import {afterNavigate} from "$app/navigation";
    import {getContext} from "svelte";
    import {List} from "$lib/youi";
    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";
    import {QUERY_CONTEXT_NAME} from "../../helper";

    const {steps,activeId,refresh,checkDirty} = getContext(QUERY_CONTEXT_NAME);

    let step:StepInfo = {id:'',text:'',name:'select',columns:[],selectedColumns:[]};

    let headerItems = [];

    afterNavigate(async ()=>{
        //初始化步骤
        step = $steps.filter(({id})=>id === $activeId)[0];
        if(step){
            headerItems = step.columns?step.columns.map(column=>({...column,id:column.name})):[];
        }
    });

    const handle_item_selected = () => {
        Object.assign(step,{
            columns:headerItems,
        });
        checkDirty();
        refresh(step)
    };

</script>

<List items={headerItems} bind:selectedIds = {step.selectedColumns} on:select={handle_item_selected}>

</List>