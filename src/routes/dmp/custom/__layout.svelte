<script lang="ts">

    import {goto} from '$app/navigation';
    import {Toolbar,Button,Icon,saveIcon} from "$lib/youi/index";
    import {onMount} from "svelte";
    import {stepStore} from "./store";
    import type {Step} from "./store";

    let activeStepId:string = undefined;

    let steps:Array<Step> = [{
        id:'step1',
        name:'select',
        tableName:'',
        text:'选字段',
        columns:[{id:'id',name:'id',text:'ID'},{id:'caption',name:'caption',text:'名称'}],
        selectedColumnNames:["id"],
    }as Step,{
        id:'step2',
        name:'filter',
        text:'过滤',
        filters:[{id:'root',text:'且',name:'and',type:'conn'}]
    } as Step,{
        id:"step3",
        name:"join",
        text:"左右连接",
        joinType:"left join",
        joinTable:"csv:file.csv",
        joinColumns:[{name:'id',left:'id',right:'id'}]
    } as Step];

    stepStore.set(steps);

    /**
     *
     */
    const show_step = async (step)=>{
        activeStepId = step.id;
        await goto("/dmp/custom/"+step.name+'/'+step.id);
    }

    const handle_save = ()=>{

        console.log($stepStore)
    }

    onMount(()=>{
        goto("/dmp/custom/select")
    })
</script>

<Toolbar>
    <Button class="btn-icon" on:click={handle_save}>
        <Icon data={saveIcon}></Icon>
    </Button>
</Toolbar>

<div class="youi-custom-query flex">
    <div class="query-nav">
        {#each steps as step}
            <div class="query-step" class:active={activeStepId==step.id}>
                <div class="step-title flex" on:click={()=>show_step(step)}>
                    <span class="step-icon"> </span>
                    <span class="step-text flex-1">{step.text}</span>
                </div>
            </div>
        {/each}
    </div>

    <div class="query-config flex-1 flex-column">
        <div style="height: 240px;overflow: auto;padding:6px;display: flex;">
            <slot></slot>
        </div>
        <div class="flex-1" style="border-top:1px solid #dddddd;">

        </div>
    </div>
</div>

<style>
    .youi-custom-query{
        height: 100%;
        border-top: 1px solid #dddddd;
    }

    .query-nav{
        border-right: 1px solid #dddddd;
        width:180px;
    }

    .query-step{
        height: 80px;
        padding:16px 8px;
        color: blue;
    }

    .query-step.active{
        color: red;
    }

    .step-title{
        height: 32px;
    }

    .step-icon{
        width:32px;
        background:#6a74a2;
        border-radius: 16px;
        z-index: 2;
        margin-right: -16px;
    }

    .step-text{
        padding-left: 20px;
        flex: 1;
        border: 1px solid #6a74a2;
        line-height: 30px;
        vertical-align: middle;
        border-radius: 2px;
        cursor: pointer;
    }

    .step-text:hover{
        background: #f1f1f1;
    }
</style>
