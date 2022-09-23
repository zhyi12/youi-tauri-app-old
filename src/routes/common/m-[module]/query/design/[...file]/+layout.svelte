<script lang="ts">
    import {writable} from "svelte/store";
    import {setContext} from "svelte";

    import {
        DataTable, Toolbar, Icon, Button, Dropdown, DropdownItem, DropdownToggle, DropdownMenu,
        saveIcon, filterIcon, sortIcon, listIcon, plusIcon, uuid
    } from "$lib/youi";
    import CodeMirror from "$lib/thirdpart/codemirror/CodeMirror.svelte";
    import {backIcon, codeIcon} from "$lib/app-icon";
    import {buildQueryScript, execute} from "$lib/tauri/tauri.dsl";

    import {buildQueryJson, QUERY_CONTEXT_NAME,ALL_STEPS} from "../../[pkid]/d-[id]/helper";
    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";
    import {findActiveIndex} from "../../helper";

    import {parseOutColumns} from "$lib/util/query.util";
    import {goto} from "$app/navigation";
    /**
     *
     */
    export let data;

    let editingSteps = data.steps;
    let activeStepId = '';
    let showScript = false;//是否显示脚本
    let showColumns = [];//数据列
    let datas = [];//预览数据
    let dataHeight = 400;
    let queryScript = '';//查询脚本
    let inputtingScript = '';//手工输入的脚本
    let lastQueryJson = '';

    let steps = writable([]);
    let activeId = writable('');

    const STEP_ICONS = {
        "reader_csv":listIcon,
        "filter":filterIcon,
        "sort":sortIcon
    };

    let openCreator = false;//打开步骤创建弹窗
    let openStep:StepInfo = undefined;//待增加的步骤
    let openIndex = 0;//
    let container:HTMLElement;
    let dirty = false;

    $: steps.set(editingSteps);
    $: activeId.set(activeStepId);
    $: activeStep = $steps.filter(({id})=>id === $activeId)[0];
    $: fullTable = activeStep?(activeStep.name === 'agg'||activeStep.name === 'filter'):false;
    $: canSave = dirty || (data.isNewQuery && $steps.length>=1 && $steps[0].uri);

    setContext(QUERY_CONTEXT_NAME,{
        steps,
        activeId,
        refresh:async(step)=>{
            await queryData(step);
        },
        checkDirty:()=>{
            dirty = true;
            console.log('check dirty');
        }
    });

    const queryData = async (step:StepInfo) => {
        //
        let activeIndex = findActiveIndex(editingSteps,step.id);
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
            inputtingScript = '';//清理手工录入的脚本
            lastQueryJson = queryJson;

            const script = await buildQueryScript(queryJson);

            queryScript = script + '\n    .limit(50)';

            const result = await execute<[]>(queryScript);
            datas = result;

        }
    }
    
    const save = () => {
        //
    }

    const handle_code_change = async ({detail}) => {
        inputtingScript = detail.value;
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
        }else if(stepInfo.name === 'join'){
            newStep = Object.assign(newStep,{columns:[],joinColumns:[],reader:'read_csv'});
        }else if(stepInfo.name === 'sort'){
            newStep = Object.assign(newStep,{orders:[{property:'',descending:false}]});
        }else if(stepInfo.name === 'filter'){
            newStep = Object.assign(newStep,{filters:[]});
        }

        editingSteps.splice(insertIndex+1,0,newStep);
        editingSteps = editingSteps;
        //定位到新步骤
        await goto(`${data.baseUri}/${newStep.id}/${newStep.name}`);
    }

</script>

<div class="page-left query-step-flow">
    {#if Array.isArray(editingSteps)}
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
                                    <span class="btn-icon"><Icon scale="1.1" data={STEP_ICONS[stepInfo.name]||listIcon}></Icon></span>
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
                            <a href={step.name!='reader'?(`${data.baseUri}/${step.id}/${step.name}`):(`${data.baseUri}`)}>{step.text||step.name}</a>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>

<div class="content flex-full flex-column">
    <Toolbar {dirty}>
        <Button title="返回" href={`/${data.module}/mydata/d-query/${data.folder}`}>
            <Icon data={backIcon}></Icon>
        </Button>
        <Button class="save" disabled={!canSave} on:click={()=>save()}>
            <Icon data={saveIcon}></Icon>
        </Button>

    <!--    <Button disabled={!inputtingScript} on:click={()=>queryByInputtingScript()}>-->
    <!--        <Icon data={playIcon}></Icon>-->
    <!--    </Button>-->
        <span>
            {#if data.isNewQuery}
                (<span style="color:green;">新查询</span>)
            {:else }
                {data.filePath}
            {/if}
        </span>
        <Button class="pull-right" title="查看脚本" active={showScript} on:click={()=>showScript=!showScript}>
            <Icon data={codeIcon}></Icon>
        </Button>
    </Toolbar>

    <div class="content flex-full">
        {#if showScript}
            <CodeMirror bind:value={queryScript} on:change={handle_code_change}></CodeMirror>
        {/if}
        <div class="content flex-full">
            <slot>

            </slot>
            <DataTable striped={true} bordered={true} {datas} bind:columns={showColumns}
                       contentHeight={fullTable?0:dataHeight}
                       class={"border-top flex-layout"+(fullTable?" flex-full flex-column":"")}>

            </DataTable>
        </div>
    </div>
</div>
<style>
    .page-left{
        padding: 12px;
        width: 150px;
    }
</style>

