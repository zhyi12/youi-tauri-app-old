<script lang="ts">
    import Condition from "./Condition.svelte";
    import {afterUpdate, getContext} from "svelte";
    import {uuid,Icon,plusIcon} from "../../youi"

    export let id:string = uuid();

    export let name:string = undefined;

    export let root = false;

    export let text:string = undefined;

    export let level = 0;

    export let children = [];

    export let type = "conn";

    let ref:HTMLElement = null;

    const {editingConn,clickNode,addCondition} = getContext("ConditionTree");

    $:node = {id:id,text:text,name:name,type:'conn'};

    afterUpdate(() => {
        if (id === $editingConn.id){
            //根据编辑中的连接更新当前连接的信息
            name = $editingConn.name;
            text = $editingConn.text;
        }
    });

</script>


{#if root}
    {#each children as child (child.id)}
        <svelte:self {...child} />
    {/each}
{:else}
    <li class="connection flex" bind:this={ref} {id}>
        <span class="connection-name flex flex-column" on:click={(event)=>{clickNode(node,event)}}>
            <div class="flex-1"></div>
            <div>
                <span>{text||''}</span>
                {#if id === 'root'}
                     <div title="点击增加条件" class="btn-add-condition" on:click|stopPropagation={()=>addCondition(node)}>
                        <Icon data={plusIcon}></Icon>
                    </div>
                {/if}
            </div>
            <div class="flex-1"></div>
        </span>
        {#if children && children.length}
            <ul class="flex-1">
                {#each children as child (child.id)}
                    {#if Array.isArray(child.children) && child.children.length}
                        <svelte:self {...child} level={level+1}/>
                    {:else}
                        <Condition {...child} level={level+1} bind:value={child.value}></Condition>
                    {/if}
                {/each}
            </ul>
        {/if}
    </li>
{/if}

<style>
    .connection{
        list-style: none;
        border-left:1px solid silver;
    }

    .connection-name{
        vertical-align: middle;
        padding:2px;
        color: #0a53be;
        cursor: pointer;
        border-right: 1px solid silver;
        margin-right: -1px;
    }

    ul{
        padding-left: 0px;
    }

    .btn-add-condition{
        padding:2px;
    }
</style>