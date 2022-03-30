<script lang="ts">

    import {onMount} from "svelte";
    import Tree from "$lib/youi/tree/Tree.svelte";
    import DataGrid from "$lib/youi/data-grid/DataGrid.svelte";
    import Text from "$lib/youi/konva/Text.svelte";
    import {read_csv} from "../../../lib/youi/tauri/command";

    let children = [
        {id:'001',text:"投资月度数据",children:[{id:"00101",text:"X201",path:"/Volumes/D/project/workspace-desktop/data_process/data.csv"}]},
        {id:'002',text:"投资年度数据",}
    ];

    let columnCount = 10;
    let data = {};

    onMount(async ()=>{
        const rows = await read_csv("/Volumes/D/project/workspace-desktop/data_process/data.csv");
        if(Array.isArray(rows) && rows.length>0){
            const headers = Object.keys(rows[0]);

            headers.forEach((header,colIndex)=>{
                data[[0,colIndex]] = {value:header,text:header};
            });

            rows.forEach((row,rowIndex)=>{
                headers.forEach((header,colIndex)=>{
                    data[[rowIndex+1,colIndex]] = {value:row[header],text:row[header]};
                });
            });

            data = data;
            console.log(data)
            columnCount = headers.length;
        }
    });

</script>

<div style:display="flex">
    <div>

    </div>
    <Tree {children} class="layout-west">

    </Tree>

    <DataGrid {...{width:1000,height:600,rowCount:20}} {columnCount} {data} class="flex-1">
        <Text slot="cell" let:cell
              x={cell.x+5}
              y={cell.y+5}
              width={cell.width}
              height={cell.height}
              text={cell.text}></Text>
    </DataGrid>
</div>
