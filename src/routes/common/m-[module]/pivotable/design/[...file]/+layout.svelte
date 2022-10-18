<script lang="ts">
    import {is_function} from "svelte/internal";
    import {goto} from "$app/navigation";
    import {Icon, saveIcon, Toolbar, Button} from "$lib/youi/index";
    import {backIcon,saveAsIcon} from "$lib/app-icon";
    import {pivotTableQuery} from "$lib/tauri/tauri.dsl";
    import PivotTable from "$lib/component/pivot-table/PivotTable.svelte";
    import {saveFile} from "$lib/tauri/tauri.fs";
    import {setContext} from "svelte";
    import {DIALOG_ADD, DIALOG_SAVE_AS, PIVOT_TABLE_DESIGN} from "./helper";

    export let data;

    //初始化透视表模型数据
    let model = {
        reader:data.reader,
        uri:data.uri,
        columns:data.columns,
        rowDimensions:data.rowDimensions,
        colDimensions:data.colDimensions,
        measureItems:data.measureItems
    };

    let dirty = false;
    let newModalOpen = false;

    let cubeData = {rowDataList:[],series:[]};//系列

    let lastQueryJson = '';
    let lastQueryResult;

    $: if(model.measureItems.length && model.rowDimensions && model.colDimensions){
        cubeDataQuery(model.measureItems).then(result=>{
            console.log(result)
            cubeData = result;
        })
    }

    setContext(PIVOT_TABLE_DESIGN,{
        getFormRecord:(name)=>{
            let formRecord = {};
            switch (name) {
                case DIALOG_ADD:
                    formRecord = {caption:'',folderPath:data.folderPath};
                    break;
                default:
                    break;

            }
            console.log('formRecord')
            console.log(formRecord)
            return formRecord
        },
        afterDialogSubmit:(name,formRecord)=>{
            if(afterActions[name] && is_function(afterActions[name])){
                afterActions[name](formRecord);
            }
        }
    });

    /**
     *
     */
    const afterActions = {
        add:async (record)=>{
            let filePath = `${record.folderPath}/${record.caption}.ypvt`;
            let result = await saveFile(filePath,JSON.stringify(model));

            if(result && result.name){
                await goto(`/common/m-${data.module}/pivotable/design/${data.folder}/${result.name}`);
            }
        },
        saveAs:(record)=>{
            //goto save as file
        },
    };

    /**
     * 立方体数据查询
     */
    const cubeDataQuery = async (measureItems)=>{
        let cubeData;
        if(measureItems.length){
            let queryJson = JSON.stringify(model);
            if(lastQueryJson != queryJson){
                lastQueryJson = queryJson;
                cubeData = await pivotTableQuery<{rowDataList:[],series:[]}>(queryJson);
            }else {
                cubeData = lastQueryResult;
            }
        }else{
            cubeData = {rowDataList:[],series:[]};
        }
        return cubeData;
    }

    const doSave = async (filePath)=>{
        const result = await saveFile(filePath,JSON.stringify(model));
        if(result){
            alert('保存成功.')
        }
    }

    /**
     *
     */
    const save = async () => {
        if(data.isNewFile){
            openDialog('add');
        }else {
            await doSave(data.filePath);
        }
    }

    /**
     *
     * @param name
     */
    const openDialog = (name) => {
        goto(`/common/m-${data.module}/pivotable/design/${data.file}/dialog/${name}`);
    }

</script>

<div class="content flex-1">
    <Toolbar class={dirty?'dirty':''}>
        <Button title="返回" href={`/${data.module}/mydata/d-pivotable/${data.folder}`}>
            <Icon data={backIcon}></Icon>
        </Button>
        <Button title="保存" on:click={()=>save()}>
            <Icon data={saveIcon}></Icon>
        </Button>
        <Button title="另存为" on:click={()=>{openDialog(DIALOG_SAVE_AS)}}>
            <Icon data={saveAsIcon}></Icon>
        </Button>

        <span style="padding-left: 30px;font-size: 0.9rem;">
            {#if data.isNewFile}
                <span style="color: green">(新透视表)</span>
            {:else}
                路径：{data.filePath}
            {/if}
        </span>
    </Toolbar>
    <PivotTable {cubeData} {dirty} sourceItems={model.columns}
                bind:rowDimensions={model.rowDimensions}
                bind:colDimensions={model.colDimensions}
                bind:measureItems = {model.measureItems}>
    </PivotTable>
</div>
<slot></slot>

<style>
    .content{
        padding-left: 1px;
    }
</style>