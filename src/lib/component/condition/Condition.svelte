<script lang="ts">
    import {afterUpdate, getContext} from "svelte";
    import {operatorItems} from "./utils";
    import {Input,uuid} from "../../youi"

    export let text:string = undefined;
    export let name:string = undefined;
    export let operator = "eq";
    export let value = "";
    export let type = "cond";
    export let dataType = 'str';
    export let property:string = undefined;
    export let id:string|number[] = uuid();
    export let level:number;

    const {editingCondition,editingOperator,clickNode,openDropdown,removeCondition,connectCondition,reload} = getContext("ConditionTree");

    $:node = {id,text,property,type,value,name,dataType,level};

    $:operatorItem = operatorItems.filter(item=>item.name==operator)[0];

    afterUpdate(() => {
        if (id === $editingCondition.id){
            //根据编辑中的条件更新当前条件的信息
            property = $editingCondition.property;
            text = $editingCondition.text;
        }

        if(id === $editingOperator.id){
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

    <div class="condition-btn-container">
        <div class="condition-btn-column">
            <span class="condition-btn" title="或" on:click={()=>connectCondition(node)}>
                或
            </span>
        </div>
        <div class="condition-btn-column">
            <span class="condition-btn" title="且" on:click={()=>connectCondition(node,'and')}>
            且
        </span>
        </div>
        <div class="condition-btn-column" >
            <span class="condition-btn btn-close" on:click={()=>removeCondition(node)}>

            </span>
        </div>
    </div>
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

    .condition-btn-container{
        width:100px;
        display: none;
    }

    .condition:hover>.condition-btn-container{
        display:flex;
    }

    .condition-btn-column{
        width:24px;
        margin-left: 5px;
    }

    .condition-btn{
        cursor: pointer;
        border: 1px solid #dddddd;
        background-color: #b9c6d2;
        border-radius: 12px;
        padding:3px;
        font-size: 0.8rem;
        line-height: 2rem;
        vertical-align: middle;
    }

    .condition-btn:hover{
        background-color: #d7a872;
    }

    .condition-btn.btn-close{
        padding: 5px 10px;
        color: red;
        font-size: 8px;
        opacity: 1;
    }

</style>