<script lang="ts">
    import DataGrid from "../data-grid/DataGrid.svelte";
    import type {Area} from "../data-grid/DataGrid.d";
    import type {Group, MeasureItem} from "./DataCube.d";

    /**
     * 分组集合
     */
    export let groups:Group[] = [];
    /**
     * 计量集合
     */
    export let measureItems:MeasureItem[] = [];

    let frozenRows = 1;
    let frozenColumns = 1;
    //合并单元格
    let mergedCells:Area[] = [{
        startRow:2,
        endRow:4,
        startCol:2,
        endCol:3
    },{
        startRow:6,
        endRow:7,
        startCol:3,
        endCol:4
    },{
        startRow:5,
        endRow:5,
        startCol:4,
        endCol:5
    },{
        startRow:28,
        endRow:32,
        startCol:3,
        endCol:5
    }];

    //sheet 数据
    let data = (({rowIndex,columnIndex})=>{
        let text = '';
        let align = 'left';
        let fill = 'white';
        if(rowIndex === 0){
            text = (columnIndex);
            fill = '#f9f9f9';
            align = 'center';
        }
        if(columnIndex === 0 ){
            text = rowIndex;
            fill = '#f9f9f9';
            align = 'center';
        }
        if(rowIndex === 0 && columnIndex===0){
            text = '';
            fill = '#f9f9f9';
        }
        return {
            text,
            fill,
            align
        };
    });
    //列宽度
    let colWidth = (columnIndex)=>{
        if(columnIndex === 0){
            return 30;
        }
        return 80;
    }

</script>

<DataGrid {mergedCells} {data} {colWidth} {frozenRows} {frozenColumns}>

</DataGrid>