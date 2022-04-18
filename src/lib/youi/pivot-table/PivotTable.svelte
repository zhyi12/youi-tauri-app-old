<script lang="ts">

    import {createEventDispatcher, onMount} from "svelte";
    import DataGrid from "../data-grid/DataGrid.svelte";
    import Text from "../konva/Text.svelte";
    import List from "../list/List.svelte";
    import ConditionTree from "../condition/ConditionTree.svelte";
    import Popover from "../popover/Popover.svelte";
    import Icon from "../icon/Icon.svelte";
    import filterIcon from '../icons/filter';
    import closeIcon from '../icons/close';
    import saveIcon from '../icons/save';
    import openIcon from '../icons/folder-open';
    import chartIcon from '../icons/bar-chart';
    import Toolbar from "../toolbar/Toolbar.svelte";
    import Button from "../button/Button.svelte";

    const FILTER_DEFAULT = [{id:'root',name:'and',text:'且',type:'conn',children:[{id:'default',text:'请选择字段',operator:'eq',type:'cond'}]}];

    export let columns = [];
    export let height = 0;

    export let clear = true;

    export let rowDataList = [];

    let dispatch = createEventDispatcher();
    let container:HTMLElement = null;

    let selectedIds = [];

    /**
     * 行维度集合
     */
    let rowDimensions = [];
    /**
     * 列维度集合
     */
    let colDimensions = [];
    /**
     * 计量项集合
     */
    let measureItems =  [];

    let filters = [].concat(FILTER_DEFAULT);
    let filterPlacement = "left";
    let filterShow = "";
    let filterIsOpen =false;

    let gridWidth = 800;

    $: rowCount = rowDataList.length;
    $: columnCount = rowDataList.length==0?0:rowDataList[0].length;
    $: tableData =_buildTableData(rowDataList);

    $:if(clear){
        rowDataList = [];
        rowDimensions =[];
        colDimensions = [];
        measureItems = [];
        selectedIds = [];
        clear = false;

        filters = [{id:'root',name:'and',text:'且',type:'conn',children:[{id:'default',text:'请选择字段',operator:'eq',type:'cond'}]}];
        filterIsOpen = false;
        filterShow='';
    }

    function _buildTableData(rowDataList){
        let data = {};
        rowDataList.forEach((row,rowIndex)=>{
            row.forEach((value,columnIndex)=>{
                data[[rowIndex,columnIndex]] = {
                    ...value,
                    value:value.text
                };
            })
        });
        return data;
    }

    $: items = columns.map(column=>({
        id:column.name,
        text:column.caption,
        ...column
    }));

    /**
     *
     * @param e
     */
    const handle_column_check = (e)=>{
        let {checked,id,text,dataType,name} = e.detail;
        if(checked){
            //
            if(rowDimensions.length==0){
                rowDimensions = rowDimensions.concat([{id,text,name:id}]);
            }else if(rowDimensions.length>0){
                let measureItem = toMeasureItem({id,name,text,dataType});
                if(measureItems.filter(({id})=>id===measureItem.id).length==0){
                    measureItems = measureItems.concat([measureItem]);
                }
            }
        }else{
            colDimensions = colDimensions.filter(dimension=>dimension.id!=id);
            rowDimensions = rowDimensions.filter(dimension=>dimension.id!=id);
            measureItems = measureItems.filter(dimension=>dimension.id!=id);
            rowDataList = [];
        }
    }

    $: if(rowDimensions.length && measureItems.length){
        dispatch('query',{rowDimensions,colDimensions,measureItems,filters});
    }

    $: if(container){
        gridWidth = container.offsetWidth*0.666;
    }

    /**
     *
     * @param e
     */
    const handle_col_drop = (e)=>{
        let item = e.detail;
        if(item){
            let exist = colDimensions.filter(({id})=>item.id===id);

            if(exist.length==0){
                colDimensions = colDimensions.concat({
                    ...item
                });
            }
        }
    }

    const handle_row_drop = (e)=>{
        let item = e.detail;
        if(item){
            let exist = rowDimensions.filter(({id})=>item.id===id);

            if(exist.length==0){
                rowDimensions = rowDimensions.concat({
                    ...item
                });
            }
        }
    }

    const handle_measure_drop = (e)=>{
        let item = e.detail;
        if(item){
            measureItems = measureItems.concat(toMeasureItem(item));
        }
    }

    const handler_filter = ()=>{
        if(rowDimensions.length && measureItems.length){
            dispatch('query',{rowDimensions,colDimensions,measureItems,filters});
        }
    }
    /**
     *
     * @param item
     */
    const toMeasureItem = (item)=>{
        let aggregate = 'number'===item.dataType?'sum':'count';
        return {
            ...item,
            id:item.id+'_'+aggregate,
            text:aggregate+'('+item.text+')',
            aggregate:aggregate
        };
    }

    onMount(()=>{
        if(!height){
            height = container.parentElement.offsetHeight - 36;
        }
    })

    const gridRowHeight = (rowIndex)=>{
        return 30
    }

    const gridColumnWidth = (columnIndex)=>{
        return 100
    }

</script>
<div class="container flex" bind:this={container}>
    <div class="flex-1">
        <Toolbar class="border-left-top">
            <Button class="btn-icon">
                <Icon data={openIcon}></Icon>
            </Button>
            <Button class="btn-icon">
                <Icon data={saveIcon}></Icon>
            </Button>
            <Button class="btn-icon disabled">
                <Icon data={chartIcon}></Icon>
            </Button>
        </Toolbar>
        <div class="data-table">
            <DataGrid {...{width:gridWidth,containerHeight:height,rowCount:20}}
                      rowHeight={gridRowHeight}
                      columnWidth={gridColumnWidth}
                      rowCount={rowCount}
                      columnCount = {columnCount}
                      bind:data={tableData} >
                <Text slot="cell" let:cell
                      x={cell.x}
                      align={cell.style.align}
                      fontFamily={cell.style.fontFamily}
                      verticalAlign={"middle"}
                      y={cell.y}
                      width={cell.width}
                      height={cell.height}
                      text={cell.text}></Text>
            </DataGrid>
        </div>
    </div>
    <div class="flex-column selection">
        <div class="flex-column">
            <span class="list-title">
                数据透视表字段
            </span>
            <div class="list-box flex-1 flex">
                <List height={240} draggable={true} bind:items={items} bind:selectedIds={selectedIds} on:check={handle_column_check}></List>
            </div>
        </div>
        <div class="flex">
            <div class="flex-1">
                <a href="###" class="list-title" id={`btn-${filterPlacement}`}>
                    <Icon data={filterIcon}></Icon>筛选器
                </a>
                <div class="list-box flex">
                    {filterShow}
                    <Popover bind:isOpen = {filterIsOpen}
                            target={`btn-${filterPlacement}`}
                            placement ={filterPlacement}>
                        <div slot="title" class="flex">
                            <span class="flex-1">{`过滤条件选择`}</span>
                            <span class="btn-icon" on:click={()=>filterIsOpen=false} >
                                <Icon data={closeIcon}></Icon>
                            </span>
                        </div>
                        <ConditionTree children={filters} bind:show={filterShow} on:filter={handler_filter} {columns}>

                        </ConditionTree>
                    </Popover>
                </div>
            </div>
            <div class="flex-1">
                <span class="list-title">列</span>
                <div class="list-box flex">
                    <List bind:items={colDimensions} droppable={true} on:drop={handle_col_drop} removable={true}></List>
                </div>
            </div>
        </div>
        <div class="flex flex-1">
            <div class="flex-1">
                <span class="list-title">行</span>
                <div class="list-box flex">
                    <List bind:items={rowDimensions}  droppable={true} on:drop={handle_row_drop} removable={true}></List>
                </div>
            </div>
            <div class="flex-1">
                <span class="list-title">值</span>
                <div class="list-box flex">
                    <List bind:items={measureItems}  droppable={true} on:drop={handle_measure_drop} removable={true}></List>
                </div>
            </div>
        </div>
    </div>
</div>

<style>

    .container{
        min-height: 560px;
    }

    .data-table{
        border: 1px solid #dddddd;
        border-right-width: 0px;
        height: 642px;
        overflow: hidden;
    }

    .selection{
        width:33.33%;
        float:left;
        border: 1px solid #dddddd;
        background: #f9f9f9;
        padding:2px 5px;
        overflow: auto;
    }

    .list-title{
        line-height: 24px;
        padding: 2px 5px;
    }

    .list-box{
        border: 1px solid #dddddd;
        background: white;
        height: 160px;
        min-height: 160px;
        max-height: 300px;
        margin: 5px;
        overflow: auto;
        border-radius: 2px;
    }
</style>