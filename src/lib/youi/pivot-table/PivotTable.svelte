<script lang="ts">

    import {createEventDispatcher, onMount, tick} from "svelte";
    import DataGrid from "../data-grid/DataGrid.svelte";
    import Text from "../konva/Text.svelte";
    import List from "../list/List.svelte";

    export let columns = [];
    export let height = 0;

    export let rowDataList = [];

    $:rowCount = rowDataList.length;
    $:columnCount = rowDataList.length==0?0:rowDataList[0].length;
    $: tableData =_buildTableData(rowDataList);

    function _buildTableData(rowDataList){
        let data = {};
        rowDataList.forEach((row,rowIndex)=>{
            row.forEach((value,columnIndex)=>{
                data[[rowIndex,columnIndex]] = {
                    text:value,
                    value:value
                };
            })
        });
        return data;
    }

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

    $:items = columns.map(column=>({
        id:column.name,
        text:column.caption,
        ...column
    }));

    /**
     *
     * @param e
     */
    const handle_column_check = (e)=>{
        let {checked,id,text} = e.detail;
        if(checked){
            //
            if(rowDimensions.length==0){
                rowDimensions = rowDimensions.concat([{id,text,name:id}]);
            }else if(rowDimensions.length>0 && measureItems.length==0){
                measureItems = measureItems.concat([{id,text,name:id,aggregate:'count'}]);
            }
        }else{
            colDimensions = colDimensions.filter(dimension=>dimension.id!=id);
            rowDimensions = rowDimensions.filter(dimension=>dimension.id!=id);
            measureItems = measureItems.filter(dimension=>dimension.id!=id);
            rowDataList = [];
        }
    }

    $: if(rowDimensions.length && measureItems.length){
        dispatch('query',{rowDimensions,colDimensions,measureItems});
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
            let aggregate = 'count';
            measureItems = measureItems.concat({
                ...item,
                id:item.id+'_'+aggregate,
                text:aggregate+'('+item.text+')',
                aggregate:aggregate
            });
        }
    }

    onMount(()=>{
        if(!height){
            height = container.parentElement.offsetHeight - 36;
        }
    })

    $:if(tableData){
        console.log('tableData')
        console.log(tableData)
    }

</script>

<div class="container flex" style:height={height+'px'} bind:this={container}>
    <div class="flex-1 data-table">
        <DataGrid {...{width:1000,height:600,rowCount:20}} rowCount={rowCount} columnCount = {columnCount} bind:data={tableData} >
            <Text slot="cell" let:cell
                  x={cell.x+5}
                  y={cell.y+5}
                  width={cell.width}
                  height={cell.height}
                  text={cell.text}></Text>
        </DataGrid>
    </div>
    <div class="flex-column selection">
        <div class="flex-column">
            <span class="list-title">
                数据透视表字段
            </span>
            <div class="list-box flex-1 flex">
                <List draggable={true} items={items} bind:selectedIds={selectedIds} on:check={handle_column_check}></List>
            </div>
        </div>
        <div class="flex">
            <div class="flex-1">
                <span class="list-title">筛选器</span>
                <div class="list-box flex">

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

    .data-table{
        border: 1px solid #dddddd;
        border-right-width: 0px;
    }

    .selection{
        width:33.33%;
        float:left;
        border: 1px solid #dddddd;
        background: #f9f9f9;
        padding:2px 5px;
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
        max-height: 200px;
        margin: 5px;
        overflow: auto;
        border-radius: 2px;
    }
</style>