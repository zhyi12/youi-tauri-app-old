<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {stepStore} from "../store";
    import type {Step} from "../store";
    import {page} from "$app/stores";
    import {Input,Icon,List,hashtagIcon,textIcon,Dropdown,DropdownToggle,DropdownMenu,DropdownItem} from "$lib/youi";
    import {findStepColumns} from "../utils";

    let step:Step = {id:'',name:'column',columns:[],selectedColumnNames:[]};
    let columns = [];

    const init = ()=>{
        let index = $stepStore.map(({id},index)=>$page.params.id==id?index:0).reduce((prev,value)=>prev+value);
        step = $stepStore[index];
        let prevStep = $stepStore[index-1];
        //合并columns
        let prevColumns = findStepColumns($stepStore,prevStep);
        let columnMap = new Map();
        step.columns.forEach(column=>columnMap.set(column.id,column));
        //合并columns
        step.columns = prevColumns.map(column=>columnMap.has(column.id)?columnMap.get(column.id):column);
    }

    const findIcon = (column)=>{
        if('number' === column.dataType){
            return hashtagIcon;
        }
        return textIcon;
    }

    const updateDataType = (column,dataType)=>{
        step.columns = step.columns.map((curColumn=>{
            if(column.id == curColumn.id){
                return {...curColumn,dataType};
            }
            return curColumn;
        }));

        stepStore.updateStep(step);
    }

    const updateText = (column,e)=>{
        step.columns = step.columns.map((curColumn=>{
            if(column.id == curColumn.id){
                return {...curColumn,text:e.target.value};
            }
            return curColumn;
        }));
        stepStore.updateStep(step);
    }

    const handle_select = (e)=>{
        stepStore.updateStep(step);
    }

    afterNavigate(()=>{
        init();
    });

</script>
<List bind:items={step.columns} bind:selectedIds={step.selectedColumnNames} itemStyle="list-item" on:select={handle_select}>
    <span class="column-item" slot="item" let:item on:mousedown|stopPropagation on:click|stopPropagation>
        <Dropdown>
            <DropdownToggle tag="span" class="list-item-icon">
                <Icon style="margin: -5px 3px 0px 3px;color:blue;" data={findIcon(item)}></Icon>
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem on:click={()=>updateDataType(item,'string')}>字符</DropdownItem>
                <DropdownItem on:click={()=>updateDataType(item,'number')}>数字</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        <Input on:input={(e)=>updateText(item,e)} value={item.text}></Input>
    </span>
</List>

<style>
    .column-item{
        display: flex;
    }
    .list-item-icon{
        padding-right:3px;
    }
</style>
