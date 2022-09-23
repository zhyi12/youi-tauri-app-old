<script lang="ts">
    import FieldFileDialog from "$lib/component/FieldFileDialog.svelte";
    import {afterNavigate} from "$app/navigation";

    import {Table,TableRow} from "$lib/youi/index";

    import {execute} from "$lib/tauri/tauri.dsl";

    import {parsePrevStepOutColumns} from "$lib/util/query.util";
    import {getContext} from "svelte";
    import {QUERY_CONTEXT_NAME,buildMergedRows} from "../../../../[pkid]/d-[id]/helper";


    const READER = 'read_csv';
    const {steps,activeId,refresh} = getContext(QUERY_CONTEXT_NAME);

    let files = [];
    let step = {id:'',name:'',text:'',columns:[],unions:[{name:READER,uri:'',columns:[]}]};

    let rows = [];

    $: if(step.columns.length && step.unions.length){
        rows = buildMergedRows(step.columns,step.unions);
        refresh(step);
    }

    const handle_file_selector = async ({detail}) => {
        //
        if(Array.isArray(detail.value)){
            for(let i=0;i<detail.value.length;i++){
                let uri = detail.value[i];

                let script = `${READER}_header("${uri}")`;
                const result = await execute(script);

                step.unions.push({
                    name:READER,
                    uri,
                    columns:result.map(header=>{
                        return  { id:header.name,name:header.name,text:header.name,dataType:header.dataType,checked:true}
                    })
                });
            }
            //
            step.unions = step.unions;
        }
        files = [];
    };

    /**
     *
     */
    const showUnions = () => {
        //
    }

    afterNavigate(async ()=>{
        //初始化步骤
        step = $steps.filter(({id})=>id === $activeId)[0];
        if(step && step.name === 'union'){
            step.columns = step.columns && step.columns.length ? step.columns : parsePrevStepOutColumns($steps,step.id);
            step.unions = step.unions||[];
        }
    })

</script>


<FieldFileDialog bind:value={files} multiple={true} caption="" placeholder="添加连接数据" class="padding"  property="uri" extensions={['csv']}
                 on:change={handle_file_selector}>

</FieldFileDialog>

<Table>
    {#each rows as row}
        <TableRow>
            <td class="row-text">{row.text}</td>
            {#each row.columns as column}
                <td class="union-column">{column.text}</td>
            {/each}
        </TableRow>
    {/each}
</Table>

<style>
    .row-text{
        width:180px;
        overflow: hidden;
    }
</style>