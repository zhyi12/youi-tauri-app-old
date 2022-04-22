<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {stepStore} from "../store";
    import type {Step} from "../store";
    import {page} from "$app/stores";
    import {findStepColumns} from "../utils";
    import {List,Icon,removeIcon,hashtagIcon,textIcon} from "$lib/youi";

    let step:Step = {id:'',name:'agg',groups:[],measureItems:[]};
    let columns = [];

    const init = ()=>{
        step = $stepStore.filter(({id})=>$page.params.id==id)[0];
        columns = findStepColumns($stepStore,step);
    }

    const handle_select = ()=>{

    }

    const handle_group_drop = (e)=>{
        let item = e.detail.drop;
        step.groups = step.groups.concat([{...item}]);
    }

    const handle_measure_item_drop = (e)=>{
        let item = e.detail.drop;
        step.measureItems = step.measureItems.concat([{aggregate:('number'===item.dataType?'sum':'count'),...item}]);
    }

    afterNavigate(()=>{
        init();
    });

</script>

<div style="width:120px;border-right:1px solid #ddd;">
    <List bind:items={columns} on:select={handle_select} draggable={true} icon={(item)=>{
        if(item && 'number'== item.dataType){
            return hashtagIcon;
        }
        return textIcon;
    }}>

    </List>
</div>
<div class:flex-1={true} class:flex-column={true}>
    <div class:flex-1={true}  class:flex-column={true} style="border-bottom: 1px solid #ddd;">
        汇总分组
        <div class="group-drop meta-drop flex-1"  on:drop={handle_group_drop}>
            {#each step.groups as group,index}
                <span class="option-item">
                    {group.text}
                    <span class="btn-remove" on:click={
                        ()=>step.groups = step.groups.length===1?[]:step.groups.splice(index,1)
                    }>
                        <Icon style="margin-top:-2px;cursor: pointer" data={removeIcon}></Icon>
                    </span>
                </span>
            {/each}
        </div>
    </div>
    <div class:flex-1={true} class:flex-column={true}>
        计量
        <div class="measure-item-drop meta-drop flex-1" on:drop={handle_measure_item_drop}>
            {#each step.measureItems as measureItem,index}
                <span class="option-item">
                    <span>{measureItem.aggregate}</span>

                    ({measureItem.text})
                    <span class="btn-remove" on:click={
                        ()=>step.measureItems = step.measureItems.length===1?[]:step.measureItems.splice(index,1)
                    }>
                        <Icon style="margin-top:-2px;cursor: pointer" data={removeIcon}></Icon>
                    </span>
                </span>
            {/each}
        </div>
    </div>
</div>

<style>
    .meta-drop{
        border: 1px dotted #ddd;
        border-radius: 8px;
        margin: 8px;
    }

    .option-item{
        float:left;
        max-width:13.33%;
        position: relative;
        border-radius: 6px;
        border:1px solid #dddddd;
        margin: 3px;
        line-height: 24px;
        padding:2px 18px 2px 5px;
    }

    .btn-remove{
        position: absolute;
        right:2px;
        cursor: pointer;
    }

    .btn-remove:hover{
        color: red;
    }
</style>
