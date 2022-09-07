<script lang="ts">
    import {onMount, setContext} from "svelte";
    import {writable} from "svelte/store";
    import {page} from "$app/stores";
    import {goto,beforeNavigate} from "$app/navigation";

    import {DataTable,Toolbar,Icon,Button,Dropdown,DropdownItem,DropdownToggle,DropdownMenu,
        saveIcon,filterIcon,sortIcon,listIcon,plusIcon,uuid} from "$lib/youi";
    import CodeMirror from "$lib/thirdpart/codemirror/CodeMirror.svelte";
    import {codeIcon} from "$lib/app-icon"
    import {buildQueryScript, execute} from "$lib/tauri/tauri.dsl";
    import {parseOutColumns} from "$lib/util/query.util";
    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

    import {ALL_STEPS, buildQueryJson, QUERY_CONTEXT_NAME} from "./helper";
    import StepCreator from "../creator/_StepCreator.svelte";


    const STEP_ICONS = {
        "reader_csv":listIcon,
        "filter":filterIcon,
        "sort":sortIcon
    };

    export let data;

    let activeStepId = '';
    let showScript = false;//是否显示脚本
    let showColumns = [];//数据列
    let datas = [];//预览数据
    let dataHeight = 400;

    let editingSteps = data.steps;
    let queryScript = "";//查询脚本
    let lastQueryJson = "";//上一次的查询json
    let steps = writable([]);
    let activeId = writable('');
    let dirty = false;

    let container = null;

    let openCreator = false;//打开步骤创建弹窗
    let openStep:StepInfo = undefined;//待增加的步骤
    let openIndex = 0;//

    $: steps.set(editingSteps);
    $: activeId.set(activeStepId);

    $: baseUri =data.baseUri;
    $: id = data.id;
    $: canSave = (id === 'create' && editingSteps.length && editingSteps[0].uri) || id!=='create';//是否可保存

    let layout = '';

    $: if(data && data.id != $page.params.id){
        //custom query切换时，更新editingSteps数据
        editingSteps = data.steps;
        queryScript = '';
        showColumns = [];
        datas = [];
    }

    setContext(QUERY_CONTEXT_NAME,{
        steps,
        activeId,
        refresh:async(step)=>{
            await queryData(step);
        },
        checkDirty:()=>{
            //dirty = value;
            console.log('check dirty');
        }
    });

    /**
     * 查询数据
     * @param step
     */
    const queryData = async (step) => {
        let activeIndex = findActiveIndex(step.id);
        let querySteps = editingSteps.slice(0,activeIndex+1);
        //清空查询表格
        showColumns = parseOutColumns(editingSteps,step);
        datas = [];

        if(showColumns && showColumns.length){
            //生成当前步骤的数据查询脚本
            let queryJson = buildQueryJson(querySteps);
            if(lastQueryJson === queryJson){
                return;
            }

            lastQueryJson = queryJson;

            const script = await buildQueryScript(queryJson);

            queryScript = script + '.limit(50)';

            console.log('do data query............');

            const result = await execute<[]>(queryScript);
            datas = result;


        }
    }

    /**
     * 保存查询
     */
    const save = () => {
        if($page.params.id === 'create'){
            //保存新自助查询
        }else{
            //更新自助查询
        }
        dirty = false;
    }
    /**
     * 插入新步骤
     * @param stepInfo
     * @param insertIndex
     */
    const insertStep = async (stepInfo,insertIndex) => {
        let newStep = {id:uuid(),name:stepInfo.name,text:stepInfo.text};
        let beforeStep = editingSteps[insertIndex];
        let beforeOutColumns = parseOutColumns(editingSteps,beforeStep);
        //
        if(stepInfo.name === 'calculator'){
            openCreator = true;
            openStep = {...newStep};
            openIndex = insertIndex;
            return;
        }else if(stepInfo.name === 'select'){
            newStep = Object.assign(newStep,{columns:beforeOutColumns,selectedColumns:beforeOutColumns.map(({name})=>name)});
        }

        editingSteps.splice(insertIndex+1,0,newStep);
        editingSteps = editingSteps;
        //定位到新步骤
        await goto(`${baseUri}/${newStep.id}/${newStep.name}`);
    }

    /**
     *
     */
    const findActiveIndex = (id) => {
        for(let i=0;i<editingSteps.length;i++){
            if(id === editingSteps[i].id){
                return i;
            }
        }
        return -1;
    }

    beforeNavigate(({to,cancel})=>{
        if(dirty){
            if(to.pathname.indexOf(`${baseUri}`) !== 0 ){
                alert(`请先保存数据.`)
                cancel();
            }
        }
    });

</script>

<Toolbar {dirty}>
    <Button class="save" disabled={!canSave} on:click={()=>save()}>
        <Icon data={saveIcon}></Icon>{layout}
    </Button>

    {#if id === 'create'}
        <span style="text-align: center;color:green">(新查询)</span>
    {/if}

    <Button class="pull-right" title="查看脚本" active={showScript} on:click={()=>showScript=!showScript}>
        <Icon data={codeIcon}></Icon>
    </Button>
</Toolbar>

<div class="content flex-row flex-full" bind:this={container}>
    <div class="page-left query-step-flow">
        {#each editingSteps as step,index}
            <div class={"query-step step-"+step.name} class:active={$activeId === step.id}>
                <div class="step-header">
                    <div class="step-line"></div>
                    <span class="step-icon">
                        <Icon scale="1.1" data={STEP_ICONS[step.name]||listIcon}></Icon>
                    </span>

                    <Dropdown >
                        <DropdownToggle tag="span" class="hover-item step-btn-add">
                            <Icon scale={index===editingSteps.length-1?1.2:0.9} data={plusIcon}></Icon>
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each ALL_STEPS as stepInfo,infoIndex}
                                <DropdownItem class="option-item" on:click={()=>insertStep(stepInfo,index)}>
                                    <Icon scale="1.1" data={STEP_ICONS[stepInfo.name]||listIcon}></Icon>
                                    <span>{stepInfo.text}</span>
                                </DropdownItem>
                                {#if infoIndex==4}
                                    <DropdownItem divider />
                                {/if}
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div class="step-main flex-1">
                    <div class="step-text flex-1">
                        {#if $activeId === step.id}
                            <span>{step.text||step.name}</span>
                        {:else}
                            <a href={step.name!='reader'?(`${baseUri}/${step.id}/${step.name}`):(`${baseUri}`)}>{step.text||step.name}</a>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
    <div class="content flex-1 flex-full">
        {#if showScript}
            <CodeMirror bind:value={queryScript}></CodeMirror>
        {/if}
        <div class="content flex-1 flex-full" class:flex-row={layout === 'row'}>
            <slot>

            </slot>
            <DataTable striped={true} bordered={true} {datas} bind:columns={showColumns} contentHeight={dataHeight} class="border-top flex-layout">

            </DataTable>
        </div>
    </div>
</div>

<StepCreator bind:isOpen={openCreator} step={openStep}/>

<style lang="scss">
    .page-left{
      padding: 12px;
      width: 150px;
    }
</style>
