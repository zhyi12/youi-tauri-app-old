<script lang="ts">

    import {localFileTreeStore,dataDirStore} from "../../store";
    import {Tree,exec_df_script,parse_columns,List} from "$lib/youi";

    let activeId:string = undefined;

    export let headerColumns = [];
    export let csvPath:string = '';

    const handle_tree_select = async (event)=>{
        if(event.detail && event.detail.datas && event.detail.datas.path && event.detail.datas.path.endsWith('.csv')){
            csvPath = $dataDirStore+event.detail.datas.path;

            let dfScript = 'read_csv("'+csvPath+'").read_first()';

            const result = await exec_df_script(dfScript);

            headerColumns = parse_columns(result[0]);
        }
    }
</script>

<div class="flex container">
    <Tree width={240} bind:activeId={activeId} children={$localFileTreeStore} class="" on:select={handle_tree_select}>

    </Tree>
    <div class="flex-1" style="border-left: 1px solid #ddd;">
        <List items={headerColumns}>

        </List>
    </div>
</div>

<style>
    .container{
        border: 1px solid #dddddd;
        border-radius: 8px;
        flex:1;
    }
</style>