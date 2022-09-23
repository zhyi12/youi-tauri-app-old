<script lang="ts">
    import {List} from "../../youi/index";

    import DataGrid from "../data-grid/DataGrid.svelte";
    import type {CellPosition} from "../data-grid/DataGrid.d";
    import type {Dimension, MeasureItem,Column} from "../cube/DataCube.d";
    import {buildTableData} from "./helper";

    export let sourceItems:Column[] = [];//
    /**
     * 行维度集合
     */
    export let rowDimensions:Dimension<any>[] = [];
    /**
     * 列维度集合
     */
    export let colDimensions:Dimension<any>[] = [];
    /**
     * 计量集合
     */
    export let measureItems:MeasureItem[] = [];

    export let cubeData = {rowDataList:[],series:[]};//立方体结果数据

    export let dirty = false;

    let selections = [];

    let data = (_cell:CellPosition)=>{return {text:''}};

    $: tableData = buildTableData(rowDimensions,colDimensions,measureItems,cubeData);

    $: if(tableData){
        selections = [];
        data = (({rowIndex,columnIndex})=>{
            let cellData = tableData.dataMap[[rowIndex,columnIndex]]||'';
            let fill = 'white';
            let align = 'left';
            let stroke = '#d9d9d9';

            if(rowIndex<tableData.frozenRows){
                fill = '#f9f9f9';
                align = 'center';
                stroke = 'black';
            }

            if(columnIndex<tableData.frozenColumns){
                fill = '#f9f9f9';
                stroke = 'black';
            }

            return {
                stroke,
                text:'',
                align,
                fill,
                ...cellData
            };
        });
    }

    //列宽度
    let colWidth = (columnIndex)=>{
        if(columnIndex < tableData.frozenColumns ){
            return Math.min(240/tableData.frozenColumns,120);
        }
        return Math.max(780/tableData.columns,80);
    }

    const handle_col_drop = ({detail}) => {
        //
        let exist = colDimensions.filter(({id})=>detail.id===id);

        if(exist.length===0){
            colDimensions = colDimensions.concat({
                ...detail,
                items:[{...detail,text:detail.name+1},{...detail,text:detail.name+2}]
            });
        }
    }

    const handle_row_drop = ({detail}) => {
        //
        let exist = rowDimensions.filter(({id})=>detail.id===id);

        if(exist.length===0){
            rowDimensions = rowDimensions.concat({
                ...detail,
                items:[{...detail,text:detail.name+1},{...detail,text:detail.name+2}]
            });
        }
    }

    const handle_measure_drop = ({detail}) => {
        //
        let item = detail.drop;
        let aggregate = 'sum';
        if(item.dataType === 'str'){
            aggregate = 'count';
        }
        let measureItem:MeasureItem = {...item,id:item.name+'_'+aggregate,aggregate,text:item.name,name:item.name};

        let exist = measureItems.filter(({id})=>measureItem.id===id);

        if(exist.length === 0){
            measureItems = measureItems.concat(measureItem);
        }
    }

</script>

<div class="content flex-full flex-row">
    {#if tableData.columns>0}
        <DataGrid  {data} {colWidth} {selections}
                  columns={tableData.columns}
                  rows={tableData.rows}
                  mergedCells={tableData.mergedCells}
                  frozenRows = {tableData.frozenRows}
                  frozenColumns = {tableData.frozenColumns}>
        </DataGrid>
    {:else }
        <div class="flex-1"></div>
    {/if}
    <div class="selection flex-column flex-full content">
        <div class="flex-column flex-1 content">
            <span class="list-title">
                数据透视表字段
            </span>
            <div class="list-box flex-1 list-column overflow">
                <List draggable={true} bind:items={sourceItems}></List>
            </div>
        </div>

        <div class="flex">
            <div class="flex-1">
                <span class="list-title" >
                    筛选器
                </span>
                <div class="list-box flex">

                </div>
            </div>
            <div class="flex-1">
                <span class="list-title">列</span>
                <div class="list-box flex">
                    <List check={false} bind:items={colDimensions} droppable={true} on:drop={handle_col_drop} removable={true}></List>
                </div>
            </div>
        </div>
        <div class="flex">
            <div class="flex-1">
                <span class="list-title">行</span>
                <div class="list-box flex">
                    <List check={false} bind:items={rowDimensions} droppable={true} on:drop={handle_row_drop} removable={true}></List>
                </div>
            </div>
            <div class="flex-1">
                <span class="list-title">值</span>
                <div class="list-box" on:drop={handle_measure_drop} >
                    {#each measureItems as measureItem}
                        <div class="option-item">
                            <span>{measureItem.aggregate}</span>
                            <span>(</span>
                            <span>{measureItem.text}</span>
                            <span>)</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .selection{
        width: 360px;
        background: #f9f9f9;
        border-left: 1px solid #dddddd;
        flex:none;
    }

    .list-title{
        line-height: 24px;
        padding: 2px 5px;
        display: inline-block;
        font-weight: bold;
    }

    .list-box{
        border: 1px solid #dddddd;
        background: white;
        height: 180px;
        min-height: 180px;
        max-height: 260px;
        margin: 5px;
        overflow: auto;
        border-radius: 2px;
    }
</style>
