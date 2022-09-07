<script lang="ts">
    import {getContext} from "svelte";
    import {afterNavigate} from "$app/navigation";

    import ConditionTree from "$lib/component/condition/ConditionTree.svelte";
    import {parsePrevStepOutColumns} from "$lib/util/query.util";
    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

    import {QUERY_CONTEXT_NAME} from "../../helper";

    const {steps,activeId,refresh} = getContext(QUERY_CONTEXT_NAME);
    const DEFAULT_CONDITIONS = [{id:'root',text:'且',name:'and',type:'conn',children:[{id:'f01',text:'请选择',name:'',type:'cond'}]}];

    let step:StepInfo = {id:'',text:'',name:'',conditions:[].concat(DEFAULT_CONDITIONS)};
    let columns = [];//从上一个步骤获取输出
    let show = '';

    afterNavigate(async ()=>{
        //初始化步骤
        step = $steps.filter(({id})=>id === $activeId)[0];
        if(step && step.name){
            if(!step.conditions || !step.conditions.length){
                step.conditions = [].concat(DEFAULT_CONDITIONS);
            }
            //
            columns = parsePrevStepOutColumns($steps,step.id);
        }
    })

    const handle_filter = async ({detail}) => {
        show = detail.show;
        await refresh(step)
    }
</script>

{#if show}
    <div class="condition-show">{show}</div>
{/if}

{#if step &&step.conditions}
    <ConditionTree children={step.conditions} {columns} class="flex-full overflow" on:change={handle_filter}/>
{/if}
<style>
    .condition-show{
        padding:2px;
        white-space: nowrap;
        width: 100%;
        line-height: 24px;
        border-bottom: 1px solid #dddddd;
        overflow: hidden;
    }
</style>