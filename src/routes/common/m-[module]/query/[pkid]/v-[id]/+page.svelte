<script lang="ts">
    import {Toolbar} from "$lib/youi";
    import {afterNavigate} from "$app/navigation";

    import {DataTable} from "$lib/youi/index";

    import {parseOutColumns} from "$lib/util/query.util";
    import {query} from "$lib/tauri/tauri.dsl";
    import {findContent} from "$lib/app-services/dmp/customQueryServices";

    import {buildQueryJson} from "../d-[id]/helper";
    import {getContext} from "svelte";

    export let data;

    let {activeQuery} = getContext("module_query");

    let showColumns = [];
    let datas = [];
    let totalCount = 0;
    let pageIndex = 1;
    let pageSize = 50;

    const queryData = async () => {
        let steps = [];
        const content:string|undefined = await findContent(data.id);
        if(!content){
            return;
        }
        steps = JSON.parse(content);
        showColumns = parseOutColumns(steps,steps[steps.length-1]);
        let queryJson = buildQueryJson(steps);
        const result = await query<{records,total}>(queryJson,pageIndex,pageSize);
        datas = result.records||[];
        totalCount = result.total;
    }

    afterNavigate(async ()=>{
        pageIndex = 1;
        await queryData();
    });

</script>

<Toolbar>
    <span style="display: inline-block;vertical-align: middle">{$activeQuery?$activeQuery.caption:''}</span>
</Toolbar>

<div class="flex-row flex-full content">
    <DataTable {totalCount} bind:pageIndex = {pageIndex} bind:pageSize = {pageSize} striped={true} bordered={true} {datas} bind:columns={showColumns}
               contentHeight={0}
               on:page = {()=>queryData()}
               class={"border-top flex-column flex-full content"}>

    </DataTable>
</div>


