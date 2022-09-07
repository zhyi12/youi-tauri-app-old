<script lang="ts">
    import {getContext} from "svelte";
    import {afterNavigate} from "$app/navigation";
    import FieldFileDialog from "$lib/component/FieldFileDialog.svelte";
    import {List,isSame} from "$lib/youi";
    import {execute} from "$lib/tauri/tauri.dsl";
    import {QUERY_CONTEXT_NAME} from "./helper";

    export let data;

    const {steps,activeId,refresh,checkDirty} = getContext(QUERY_CONTEXT_NAME);

    let step = {id:'',text:'',name:'reader',reader:'read_csv',uri:'',columns:[],selectedColumns:[]};
    let headerItems = [];
    let initSelectedColumns = [];

    $: readonly = !(data.id === 'create' && $steps.length === 1);

    //reader
    afterNavigate(async ()=>{
        step = $steps[0];//第一步
        activeId.set(step.id);//active当前步骤
        headerItems = step.columns?step.columns.map(column=>({...column,id:column.name})):[];
        step.selectedColumns = step.selectedColumns||[];
        initSelectedColumns = step.selectedColumns.map(name=>name);
    });

    /**
     * 选择文件
     * @param detail
     */
    const handle_file_selector = async ({detail}) => {
        if(detail.value){
            let script = `read_csv_header("${detail.value}")`;
            const result = await execute(script);
            headerItems = result.map(header=>{
                return  { id:header.name,name:header.name,text:header.name,dataType:header.dataType,checked:true}
            });
            step.selectedColumns = headerItems.map(({id})=>id);
            stepChanged(true);
        }
    }

    /**
     *
     */
    const handle_column_select = () => {
        stepChanged(!isSame(initSelectedColumns,step.selectedColumns));
    }
    /**
     *
     */
    const stepChanged = (dirty) => {
        Object.assign(step,{columns:headerItems});
        if(dirty){
            checkDirty();
        }
        refresh(step);
    }

</script>

<FieldFileDialog class="padding" {readonly} bind:value={step.uri} property="uri" extensions={['csv']}
                 on:change={handle_file_selector}>

</FieldFileDialog>

<div class="flex-full padding content border-top">
    <List items={headerItems} bind:selectedIds = {step.selectedColumns} on:select={handle_column_select}>

    </List>
</div>







