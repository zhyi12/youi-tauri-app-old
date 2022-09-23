<script lang="ts">

    import {getContext} from "svelte";
    import {afterNavigate} from "$app/navigation";

    import {List, Dropdown, DropdownMenu, DropdownToggle, DropdownItem, Icon, removeIcon} from "$lib/youi/index";

    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";
    import {parsePrevStepOutColumns} from "$lib/util/query.util";

    import {QUERY_CONTEXT_NAME, AGG_LIST, STR_AGG_LIST} from "../../../../[pkid]/d-[id]/helper";;

    const {steps, activeId, refresh} = getContext(QUERY_CONTEXT_NAME);

    let step: StepInfo = {id: '', text: '', name: '', groups: [], measureItems: []};
    let columns = [];//从上一个步骤获取输出

    /**
     * 拖入分组
     * @param detail
     */
    const handle_drop_group = ({detail}) => {
        if (detail && detail.drop) {
            step.groups = step.groups.concat([{name: detail.drop.name, text: detail.drop.text}]);
            stepChanged();
        }
    }
    /**
     * 拖入计量
     * @param detail
     */
    const handle_drop_measure_item = ({detail}) => {
        if (detail && detail.drop) {
            let aggregate = detail.drop.dataType === 'str' ? 'count' : 'sum';
            step.measureItems = step.measureItems.concat([{
                aggregate,
                id: detail.drop.name + '_' + detail.drop.name,
                name: detail.drop.name,
                text: detail.drop.text,
                dataType: detail.drop.dataType
            }]);
            stepChanged();
        }
    }

    const stepChanged = () => {
        if (step.measureItems.length && step.groups.length) {
            refresh(step)
        }
    }

    const changeMeasureAggregate = (measureItem,aggregate) => {
        if(measureItem.aggregate!==aggregate){
            let id = measureItem.name+'_'+aggregate;
            Object.assign(measureItem,{id,aggregate});
            step.measureItems = step.measureItems;
            refresh(step);
        }
    }

    afterNavigate(async () => {
        step = $steps.filter(({id}) => id === $activeId)[0];
        if (step && step.name) {
            columns = parsePrevStepOutColumns($steps, step.id);
            if (!step.groups) step.groups = [];
            if (!step.measureItems) step.measureItems = [];
            refresh(step);
        }
    })
</script>

<div class="flex flex-flow container">
    <div class="page-left">
        <List check={false} draggable={true} items={columns}></List>
    </div>
    <div class="flex-1 flex flex-column padding">
        <div class="flex-1 group-container" on:drop={handle_drop_group}>
            <h6 class="header">分组</h6>
            {#each step.groups as group,index}
                <span class="group">
                    <span class="item-text">{group.text || group.name}</span>
                    <span class="btn-remove"
                          on:click={()=>{
                              step.groups.splice(index,1);
                              step.groups = step.groups;
                              stepChanged();
                          }}
                    ><Icon data={removeIcon}></Icon></span>
                </span>
            {/each}
        </div>

        <div class="flex-1 measure-item-container border-top padding" on:drop={handle_drop_measure_item}>
            <h6>计量</h6>
            {#each step.measureItems as item,index}
                <span class="measure-item flex">
                    <Dropdown>
                        <DropdownToggle tag="span">
                            <b style="color: green;">{item.aggregate}</b>
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each !item.dataType || item.dataType === 'str' ? STR_AGG_LIST : AGG_LIST as agg}
                                <DropdownItem  on:click={()=>changeMeasureAggregate(item,agg.name)}>
                                    {agg.text}
                                </DropdownItem>
                            {/each}
                        </DropdownMenu>
                    </Dropdown>

                    <span>(</span>
                    <span class="item-text">{item.text || item.name}</span>
                    <span>)</span>
                    <span class="btn-remove" on:click={()=>{
                        step.measureItems.splice(index,1);
                        step.measureItems = step.measureItems;
                        stepChanged();
                    }}><Icon data={removeIcon}></Icon></span>
                </span>
            {/each}
        </div>
    </div>
</div>
<style lang="scss">
  .container{
    height:240px;
  }

  .page-left {
    width: 300px;
    border-right: 1px solid #dddddd;
    overflow: auto;
  }

  .group, .measure-item {
    border: 1px solid #dddddd;
    border-radius: 5px;
    background-color: #f9f9f9;
    float: left;
    margin: 3px;
    padding: 0px 5px;

    .btn-remove {
      display: none;
    }

    &:hover{
      .btn-remove {
        display: inline;
      }
    }

    .item-text{
      max-width: 200px;
      overflow: hidden;
      white-space: nowrap;
    }
  }
</style>