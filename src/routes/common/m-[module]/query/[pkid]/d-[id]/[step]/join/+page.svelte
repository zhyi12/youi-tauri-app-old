<!------------------------------------------------------------------------------------------
    左右连接配置页面
------------------------------------------------------------------------------------------->
<script lang="ts">
    import {getContext} from "svelte";
    import {afterNavigate} from "$app/navigation";

    import {FieldSelect, Input, Icon,listIcon,plusIcon} from "$lib/youi";
    import FieldFileDialog from "$lib/component/FieldFileDialog.svelte";
    import {execute} from "$lib/tauri/tauri.dsl";
    import {parsePrevStepOutColumns} from "$lib/util/query.util";

    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

    import {QUERY_CONTEXT_NAME,JOIN_TYPES} from "../../helper";

    const {steps,activeId,refresh} = getContext(QUERY_CONTEXT_NAME);

    //step.columns 存储连接表的列（右表列）
    let step:StepInfo = {id:'',text:'',name:'reader',reader:'read_csv',uri:'',columns:[],joinColumns:[]};
    let leftColumns =  []; //左表列
    /**
     * 选择文件
     * @param detail
     */
    const handle_file_selector = async ({detail}) => {
        if(detail.value){
            step.joinColumns = [];//清理旧的连接
            await readRightColumns();
        }
    }

    const handle_column_select = () => {
        //
    }

    const readRightColumns = async  () => {
        let script = `${step.reader}_header("${step.uri}")`;
        const result = await execute(script);
        step.columns = result.map(header=>{
            return  { id:header.name,name:header.name,text:header.name,dataType:header.dataType,checked:true}
        });
    }

    const addJoinColumn = () => {
        step.joinColumns.push({name:'',left:'',right:''});
        step.joinColumns = step.joinColumns;
    }

    const stepChanged = () => {
        //
        refresh(step);
    }

    /**
     * 初始化页面逻辑
     */
    afterNavigate(async ()=>{
        step = $steps.filter(({id})=>id === $activeId)[0];
        if(step && step.name){
            leftColumns = parsePrevStepOutColumns($steps,step.id);
            if(step.reader && step.uri && (!step.columns || !step.columns.length)){
                await readRightColumns();
            }
            step.joinColumns = step.joinColumns||[];
            step.columns = step.columns||[];

            if(step.columns.length && step.joinColumns.length){
                refresh(step);
            }
        }
    });
</script>

<div class="flex-full flex-row content border-top">
    <div class="join-selector">
        <FieldFileDialog caption="" placeholder="选择连接数据" class="padding" bind:value={step.uri} property="uri" extensions={['csv']}
                         on:change={handle_file_selector}>

        </FieldFileDialog>
        <div class="padding">连接方式</div>
        <div class="padding flex flex-row">
            {#each JOIN_TYPES as joinType}
                <div class="option-item join-how" on:click={()=>{
                    if(step.joinHow != joinType.name){
                        step.joinHow = joinType.name
                        stepChanged();
                    }
                }} class:selected={joinType.name === step.joinHow}>
                    <span><Icon data={listIcon}></Icon></span>
                    <span>{joinType.text}</span>
                </div>
            {/each}
        </div>
    </div>
    <div class="join-container flex-full padding">
        {#each step.joinColumns as joinColumn}
            <div class="flex flex-row join-column-item">
                <FieldSelect on:select={()=>stepChanged()} class="flex-1" selectedId={joinColumn.left} bind:value={joinColumn.left} items={leftColumns}></FieldSelect>
                <FieldSelect on:select={()=>stepChanged()} class="flex-1" selectedId={joinColumn.right} bind:value={joinColumn.right} items={step.columns}></FieldSelect>
                <Input class="flex-1" bind:value={joinColumn.name}></Input>
            </div>
        {/each}

        <div>
            <span class="btn-icon" on:click={()=>addJoinColumn()}><Icon data={plusIcon}></Icon></span>
        </div>
    </div>
</div>

<style>
    .join-selector{
        width:300px;
        border-right: 1px solid #dddddd;
    }

    .join-how{
        border-radius: 6px;
        margin: 3px;
    }

    .join-how.selected{
        background: #b9c6d2;
    }
</style>