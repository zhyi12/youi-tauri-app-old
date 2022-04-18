<script lang="ts">
    import {afterUpdate, getContext} from "svelte";
    import {operatorItems} from "./utils";
    import Input from "../input/Input.svelte";
    import Icon from "../icon/Icon.svelte";
    import removeIcon from "../icons/remove";
    import linkIcon from "../icons/link";
    import {uuid} from "../util/utils";

    export let text:string = undefined;
    export let operator = "eq";
    export let value = "";
    export let type = "cond";
    export let property:string = undefined;
    export let id:string|number[] = uuid();
    export let level:number;

    const {editingCondition,editingOperator,clickNode,openDropdown,removeCondition,connectCondition,reload} = getContext("ConditionTree");

    $:node = {id:id,text:text,property:property,type:'cond',value:value};

    $:operatorItem = operatorItems.filter(item=>item.name==operator)[0];

    afterUpdate(() => {
        if (id === $editingCondition.id){
            //根据编辑中的条件更新当前条件的信息
            property = $editingCondition.property;
            text = $editingCondition.text;
        }

        if(id == $editingOperator.id){
            operator = $editingOperator.name;
        }
    });

</script>

<li class="condition">
    <span class="condition-text" on:click={(event)=>{clickNode(node,event)}}>{text}</span>
    <span class="condition-operator" on:click={(event)=>{openDropdown('operator',node,event)}}>{operatorItem?operatorItem.text:'='}</span>
    <span class="condition-input">
        <Input bind:value={value} on:change={()=>reload()} class="input"></Input>
    </span>

    <span class="btn btn-sm" title="连接新条件" on:click={()=>connectCondition(node)}>
        <Icon data={linkIcon}></Icon>
    </span>

    <span class="btn btn-sm" on:click={()=>removeCondition(node)}>
         <Icon data={removeIcon}></Icon>
    </span>
</li>

<style>
    .condition{
        list-style: none;
        border-left: 1px solid silver;
        border-bottom: 1px solid silver;
        padding:2px;
        margin-bottom: -1px;
        display: flex;
        line-height: 26px;
    }

    .condition-text{
        color:green;
        padding:2px;
        cursor: pointer;
        display: inline-block;
        min-width: 80px;
        text-align: right;
        max-width: 120px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        background: #f1f1f1;
        border-radius: 6px;
    }

    .condition-input{
        flex:1;
    }

    .condition-operator{
        color:green;
        padding:2px 5px;
        cursor: pointer;
    }

</style>