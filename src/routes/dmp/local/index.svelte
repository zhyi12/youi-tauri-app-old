<script lang="ts">

    import {onMount} from "svelte";
    import {Tree,DataGrid,Offcanvas,Button,Toolbar,Icon,Text,TabContent,TabPane} from "$lib/youi/index";
    import {exec_df_script, read_csv, walk_data_file} from "$lib/youi/tauri/command";
    import {buildPathTree} from "$lib/youi/util/tree.util";
    import PivotTable from "$lib/youi/pivot-table/PivotTable.svelte";
    import cube from "$lib/youi/icons/cube";
    import {buildDfScript, buildTableData} from "$lib/youi/util/cube.util";
    import type {Cube} from "$lib/youi/util/cube.util";

    let children = [
        {id:'001',text:"投资月度数据",children:[{id:"00101",text:"X201",datas:{path:"/Volumes/D/project/workspace-desktop/data_process/data.csv"}}]},
        {id:'002',text:"投资年度数据",}
    ];

    let columnCount = 0;
    let data = {};
    let dataDir = '/Volumes/D/data/local';
    let csvPath = '';
    let headers = [];

    let rowDataList = [];

    $: columns = headers.map(header=>{
        return {
            name:header,
            caption:header
        }
    });

    const handle_tree_select = async (event)=>{
        if(event.detail && event.detail.datas && event.detail.datas.path && event.detail.datas.path.endsWith('.csv')){
            await open_csv(event.detail.datas.path);
        }
    }

    const open_csv = async (path)=>{
        csvPath = dataDir+path;
        const rows = await read_csv(csvPath);
        let gridData = parseGridDataFromRows(rows);
        headers = gridData.headers;
        data = gridData.data;
        columnCount = gridData.columnCount;
    }

    const parseGridDataFromRows = (rows)=>{
        let headers = [];
        let gridData = {data:{},headers:[],columnCount};
        if(Array.isArray(rows) && rows.length>0){
            headers = Object.keys(rows[0]);
            let csvData = {};
            headers.forEach((header,colIndex)=>{
                csvData[[0,colIndex]] = {value:header,text:header};
            });

            rows.forEach((row,rowIndex)=>{
                headers.forEach((header,colIndex)=>{
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
    const togglePivotTable = () => (open = !open);

    /**
     *
     * @param e
     */
    const handle_pivot_table_query = async (e)=>{
        let cube = e.detail as Cube;
        let groupDimensions = [].concat(cube.colDimensions).concat(cube.rowDimensions);
        let measureItems = cube.measureItems;

        let script = buildDfScript(csvPath,groupDimensions,measureItems);

        console.log(script)

        const df = await exec_df_script(script);

        rowDataList = buildTableData(cube,df);
    }

    onMount(async ()=>{
        const paths = await walk_data_file(dataDir);
        children = buildPathTree(paths);
    });

</script>

<div style:display="flex" class="content">
    <div class="layout-west">

        <TabContent>
            <TabPane tabId="localData" tab="本地数据" active>
                <Tree {children} class="" on:select={handle_tree_select}>

                </Tree>
            </TabPane>
            <TabPane tabId="remoteData" tab="远程数据">
                远程数据
            </TabPane>
        </TabContent>
    </div>

    <div class="flex-1">
        <Toolbar>
            <Button color="light" size="sm" on:click={()=>{open=true}}>
                <Icon data={cube}></Icon>
                数据透视表
            </Button>
        </Toolbar>
        <DataGrid {...{width:1000,height:600,rowCount:20}} {columnCount} {data} >
            <Text slot="cell" let:cell
                  x={cell.x+5}
                  y={cell.y+5}
                  width={cell.width}
                  height={cell.height}
                  text={cell.text}></Text>
        </DataGrid>
    </div>
    <Offcanvas width="90%" isOpen={open} toggle={togglePivotTable} placement="end" header="透视表">
        <PivotTable {columns} on:query={handle_pivot_table_query} bind:rowDataList={rowDataList} ></PivotTable>
    </Offcanvas>
</div>

<style>
    .content{
        background: white;
        border-radius: 5px;
    }

    .flex-1{
        border-left: 1px solid #ddd;
    }
</style>
