<script lang="ts">
    import DataGrid from "../data-grid/DataGrid.svelte";
    import type {Dimension, MeasureItem} from "../cube/DataCube.d";
    import {buildDataMap,findMergedCells} from "./helper";
    import {expandDimensionsItem} from "../cube/helper";

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

    /**
     * 立方体行数据： 分组项1｜分组项2｜...｜计量
     */
    export let cubeRowDataList = [];

    let frozenRows = colDimensions.length || 1;
    let frozenColumns = rowDimensions.length;//一列展示

    //行展开项
    $: rowCrossItems = expandDimensionsItem(rowDimensions);
    $: colCrossItems = (measureItems.length>1 || colDimensions.length === 0)?
        expandDimensionsItem(colDimensions.map(dim=>({...dim}))
            .concat([{"id":"measure",name:'measure',text:'值',items:measureItems.map(item=>({...item})) }]))
        :expandDimensionsItem(colDimensions);

    $: mergedCells = findMergedCells(frozenRows,frozenColumns,rowCrossItems,colCrossItems);
    $: dataMap = buildDataMap(frozenRows,frozenColumns,rowCrossItems,colCrossItems,measureItems,cubeRowDataList);
    $: rows = (rowCrossItems.length||1) + frozenRows;
    $: columns = colCrossItems.length + frozenColumns;
    //sheet 数据
    let data = (({rowIndex,columnIndex})=>{
        let data = dataMap[[rowIndex,columnIndex]]||'';
        let fill = 'white';
        let align = 'left';
        let stroke = '#d9d9d9';

        if(rowIndex<frozenRows){
            fill = '#f9f9f9';
            align = 'center';
            stroke = 'black';
        }

        if(columnIndex<frozenColumns){
            fill = '#f9f9f9';
            stroke = 'black';
        }

        return {
            stroke,
            text:'',
            align,
            fill,
            ...data
        };
    });
    //列宽度
    let colWidth = (columnIndex)=>{
        if(columnIndex < frozenColumns ){
            return 240/frozenColumns;
        }
        return Math.max(780/columns,80);
    }

</script>

<div class="content flex-full flex-row">
    <DataGrid {columns} {rows} {mergedCells} {data} {colWidth} {frozenRows} {frozenColumns}>

    </DataGrid>
    <div class="selection">

    </div>
</div>

<style>
    .selection{
        width: 300px;
    }
</style>
