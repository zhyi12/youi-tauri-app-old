<script lang="ts">
    import {page} from '$app/stores';
    import {exec_df_script, read_csv} from "../../../lib/youi/tauri/command";
    import Toolbar from "../../../lib/youi/toolbar/Toolbar.svelte";
    import Button from "../../../lib/youi/button/Button.svelte";
    import Icon from "../../../lib/youi/icon/Icon.svelte";
    import cubeIcon from '../../../lib/youi/icons/cube'
    import DataGrid from "../../../lib/youi/data-grid/DataGrid.svelte";
    import Text from "../../../lib/youi/konva/Text.svelte";
    import Offcanvas from "../../../lib/youi/offcanvas/Offcanvas.svelte";
    import PivotTable from "../../../lib/youi/pivot-table/PivotTable.svelte";
    import {buildDfScript, buildTableData} from "../../../lib/youi/util/cube.util";
    import type {Cube} from "../../../lib/youi/util/cube.util";

    let columnCount = 0;
    let rowCount = 0;
    let data = {};
    let dataDir = '/Volumes/D/data/local';
    let headers = [];

    let rowDataList = [];

    let csvPath:string = undefined;

    $: columns = headers.map(header=>{
        return {
            ...header,
            caption:header.name
        }
    });
    /**
     * 订阅page变化，重新设置csv文件路径
     */
    page.subscribe(async (value)=>{
        let path = decodeURIComponent(value.url.searchParams.get("path"));
        if(path){
            csvPath = dataDir + path;
        }
    });

    $: if(csvPath){
        open_csv();//打开csv文件
    }

    const open_csv = async ()=>{
        const rows = await read_csv(csvPath);
        if(rows && rows.length){
            let gridData = parseGridDataFromRows(rows);
            headers = gridData.headers;
            data = gridData.data;
            columnCount = gridData.columnCount;
            rowCount = rows.length;
        }
    }

    /**
     *
     * @param rows
     */
    const parseGridDataFromRows = (rows)=>{
        let headerKeys = [];
        let headers = [];
        let gridData = {data:{},headers:[],columnCount};
        if(Array.isArray(rows) && rows.length>0){
            let firstRow = rows[0];
            headerKeys = Object.keys(firstRow);
            let csvData = {};
            headerKeys.forEach((header,colIndex)=>{
                csvData[[0,colIndex]] = {value:header,text:header,fill:'#f1f1f1',style:{align:'center',fontStyle:'bold'}};
                headers.push({
                    name:header,
                    dataType:typeof (firstRow[header])
                });
            });

            rows.forEach((row,rowIndex)=>{
                headerKeys.forEach((header,colIndex)=>{
                    csvData[[rowIndex+1,colIndex]] = {value:row[header],text:row[header]};
                });
            });
            gridData.data = csvData;
            gridData.headers = headers;
            gridData.columnCount = headers.length;
        }
        return gridData;
    }

    let open = false;
    const togglePivotTable = () => {
        open = !open;
        rowDataList = [];
        if(!open){
            headers = headers;
        }
    };

    /**
     *
     * @param e
     */
    const handle_pivot_table_query = async (e)=>{
        let cube = e.detail as Cube;
        let groupDimensions = [].concat(cube.colDimensions).concat(cube.rowDimensions);
        let measureItems = cube.measureItems;

        let script = buildDfScript(csvPath,groupDimensions,measureItems,cube.filters);
        const df = await exec_df_script(script);
        //
        rowDataList = buildTableData(cube,df);
    }

</script>

<Toolbar>
    <Button color="light" size="sm" on:click={()=>{headers.length?open=true:false}}>
        <Icon data={cubeIcon}></Icon>
        数据透视表
    </Button>
    <span style="text-align: right;flex: 1;line-height: 28px;font-size: 14px;padding: 2px 16px;color: darkgreen;">{csvPath}</span>
</Toolbar>
<DataGrid {...{width:1000,containerHeight:600}} {rowCount} {columnCount} {data} columnWidth={()=>100}>
    <Text slot="cell" let:cell
          x={cell.x}
          y={cell.y+1}
          width={cell.width}
          height={cell.height}
          align={cell.style.align}
          fontStyle={cell.style.fontStyle}
          padding={3}
          verticalAlign={"middle"}
          text={cell.text}></Text>
</DataGrid>

<Offcanvas width="90%" isOpen={open} toggle={togglePivotTable} placement="end" header="数据透视表">
    <PivotTable clear={!open} bind:columns={columns} on:query={handle_pivot_table_query} bind:rowDataList={rowDataList} ></PivotTable>
</Offcanvas>