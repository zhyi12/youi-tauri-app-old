<script lang="ts">
    import {getContext} from "svelte";
    import {afterNavigate} from "$app/navigation";

    import {FieldSelect, Icon, plusIcon, removeIcon} from "$lib/youi/index";

    import type {StepInfo,Column} from "$lib/app-entity/dmp/customQuery";
    import {parsePrevStepOutColumns} from "$lib/util/query.util";

    import {QUERY_CONTEXT_NAME} from "../../helper";

    const boolItems = [{id:'1',text:'降序'},{id:'0',text:'升序'}];
    const {steps,activeId,refresh} = getContext(QUERY_CONTEXT_NAME);

    let step:StepInfo = {id:'',text:'',name:'sort',orders:[{property:'',descending:false}]};
    let items = [];

    afterNavigate(async ()=>{
        //初始化步骤
        step = $steps.filter(({id})=>id === $activeId)[0];
        if(step && step.name === 'sort'){
            let columns:Column[] = parsePrevStepOutColumns($steps,step.id);
            items = columns.map(column=>({id:column.name,text:column.text}));
            step.orders = step.orders||[{property:'',descending:false}];
        }
    })

    const changeDescending = (detail,order) => {
        order.descending = detail.selectedItem.id === '1';
        doChange();
    }

    const doChange = () => {
        refresh(step);
    }

    const insertOrder = (index) => {
        step.orders.splice(index+1,0,{property:'',descending:false});
        step.orders = step.orders;
    }

    const removeOrder = (index) => {
        step.orders.splice(index,1);
        step.orders = step.orders;
    }

</script>

<div class="flex-full sort-container">
    {#each step.orders as order,index}
        <div class="flex sort-item flex-group">
            <FieldSelect placeholder={"请选择字段"} selectedId={order.property} {items} bind:value={order.property} on:select={()=>doChange()}></FieldSelect>
            <FieldSelect class="width-64" selectedId={order.descending?'1':'0'} items={boolItems} on:select={({detail})=>changeDescending(detail,order)}></FieldSelect>
            <div class="btn-sort" on:click={()=>insertOrder(index)}><Icon data={plusIcon}></Icon></div>
            {#if index>0}
                <div class="btn-sort btn-remove" on:click={()=>removeOrder(index)}><Icon data={removeIcon}></Icon></div>
            {/if}
            <div class="connect">
                /
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
  .sort-container{
    .sort-item {
      margin: 3px;
      border-radius: 4px;
      padding: 2px;
      background-color: #f9f9f9;
      float: left;

      &:hover{
        .btn-sort{
          display: inline;
        }
      }

      &:last-child{
        .connect{
          display: none;
        }
      }

      .connect{
        line-height: 2rem;
        background: white;
        padding:0 5px;
      }
    }

    .btn-sort {
      display:none;
      line-height: 1.8rem;
      padding: 0 6px;
      cursor: pointer;
      &:hover{
        background: white;
      }
      &.btn-remove{
        color: red;
      }
    }
  }
</style>