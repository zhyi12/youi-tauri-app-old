<script lang="ts">

    import {goto} from '$app/navigation';
    import {onMount} from "svelte";
    import {stepStore} from "./store";
    import type {Step} from "./store";
    import {Toolbar,Button,Icon,saveIcon,playIcon,
        plusIcon,filterIcon,Dropdown,DropdownToggle,DropdownMenu,DropdownItem,Offcanvas,uuid,exec_df_script} from "$lib/youi";

    import {ALL_STEPS, buildStepsScript, findStepColumns, findStepIndex, SIMPLE_STEP_NAMES} from "./utils";

    import SelectCreator from "./select/Creator.svelte";
    import FilterCreator from "./filter/Creator.svelte";
    import JoinCreator from "./join/Creator.svelte";
    import AddColumnCreator from "./addcol/Creator.svelte";

    let activeStepId:string = undefined;
    let selectColumns = [];
    let selectCsvPath = '';

    let openStepAdding = false;
    let currentAddingStep:Step = undefined;
    let currentAddingIndex:number = undefined;

    let steps:Array<Step> = [{
        id:'step1',
        name:'select',
        reader:'read_csv',
        uri:'/Volumes/D/data/local/年度数据/1-2月基层库.csv',
        text:'选字段',
        columns:[{id:'项目名称',name:'项目名称',text:'项目名称',dataType:'string'}
            ,{id:'项目类别2017',name:'项目类别2017',text:'项目类别2017'},
            {id:'计划总投资',name:'计划总投资',text:'计划总投资',dataType:'number'},
            {id:'登记注册类型2012',name:'登记注册类型2012',text:'登记注册类型2012'},
        ],
        selectedColumnNames:["项目名称",'项目类别2017','计划总投资','登记注册类型2012'],
    }as Step,{
        id:'step11',
        name:'column',
        text:'字段设置',
        columns:[{id:'项目名称',name:'项目名称',text:'项目名称',dataType:'string'}
            ,{id:'项目类别2017',name:'项目类别2017',text:'项目类别2017'},
            {id:'计划总投资',name:'计划总投资',text:'计划总投资',dataType:'number'},
            {id:'登记注册类型2012',name:'登记注册类型2012',text:'登记注册类型2012'},
        ],
        selectedColumnNames:["项目名称",'项目类别2017','计划总投资','登记注册类型2012'],
    } as Step,{
        id:'step12',
        name:'addcol',
        text:'新增列',
        addedColumn:{name:'newCol',text:'计算列',expression:'(col("计划总投资")+1.2)+3'},
    } as Step,{
        id:'step2',
        name:'filter',
        text:'过滤',
        filters:[{id:'root',text:'且',name:'and',type:'conn'}]
    } as Step,{
        id:"step3",
        name:"join",
        text:"左右连接",
        joinType:"left join",
        joinTable:"csv:file.csv",
        joinColumns:[{name:'id',left:'id',right:'id'}]
    } as Step];

    $:if(steps)stepStore.set(steps);

    let querying = false;

    /**
     *
     */
    stepStore.subscribe(async (steps)=>{
        if(activeStepId){
            let activeStep = steps.filter(({id})=>id==activeStepId)[0];
            await doStepQuery(activeStep);
        }
    })

    /**
     *
     */
    const showStep = async (step)=>{
        if(activeStepId && activeStepId==step.id){
            return;
        }
        activeStepId = step.id;
        await goto("/dmp/custom/"+step.name+'/'+step.id);

        if(step.name =='addcol' ||step.name =='filter' ||step.name =='join'  ||step.name =='union'){
            await doStepQuery(step);
        }

    }

    let queryScript = '';
    let rows = [];
    
    const doStepQuery = async (step)=>{
        if(!querying){
            querying = true;
            let stepIndex = findStepIndex(steps,step);
            queryScript = buildStepsScript(steps.slice(0,stepIndex+1));
            querying = false;
        }
    }

    const handle_save = ()=>{
        //console.log($stepStore)
    }

    /**
     *
     */
    const handle_query= async ()=>{
        if(steps.length>0 && queryScript){
            rows = await exec_df_script(queryScript);
        }
    }

    const handle_open_custom_add = ()=>{
        openStepAdding = true;
        currentAddingStep = {name:'select',text:'新增自助数据集',id:uuid()};
        currentAddingIndex = 0;
    }

    const openStepAdd = (stepInfo,index) =>{
        if(SIMPLE_STEP_NAMES.includes(stepInfo.name)){
            addNewStep(stepInfo,index);
        }else{
            if(stepInfo.name == 'addcol'){
                stepInfo.addedColumn = {id:uuid(),name:'',expression:''};
            }
            openStepAdding = true;
            currentAddingStep = stepInfo;
            currentAddingIndex = index;
        }
    }

    const addNewStep = (newStep,insertIndex) =>{
        newStep = {id:uuid(),...newStep};
        if(newStep.name == 'select'){
            let columns = selectColumns.map(column=>({...column}));
            if(selectCsvPath && columns.length){

                newStep.columns = columns;
                newStep.selectedColumnNames = columns.map(({name})=>name);
                newStep.reader = 'read_csv';
                newStep.uri = selectCsvPath;
                steps = [newStep];
                rows = [];
                showStep(newStep);
            }
            return;
        }else if(newStep.name == 'filter'){
            newStep.filters = [{id:'root',text:'且',name:'and',type:'conn'}];
        }else if(newStep.name == 'agg'){
            newStep.groups = [];
            newStep.measureItems = [];
        }else if(newStep.name === 'column'){
            let prevColumns = findStepColumns(steps,steps[insertIndex]);
            newStep.columns = prevColumns.map(column=>({...column}));
            newStep.selectedColumnNames = prevColumns.map(({name})=>name);
        }

        if(insertIndex == steps.length-1){
            steps.push(newStep);
        }else{
            steps.splice(insertIndex+1,0,newStep)
        }
        steps = steps;
        showStep(newStep);
    }

    const findIcon = (stepName)=>{
        switch(stepName){
            case 'filter':
                return  filterIcon;
        }
        return saveIcon;
    }

    onMount(()=>{
        goto("/dmp/custom/select")
    })
</script>

<Toolbar>
    <Button class="btn-icon" on:click={handle_open_custom_add}>
        <Icon data={plusIcon}></Icon>
    </Button>
    <Button class="btn-icon" on:click={handle_save}>
        <Icon data={saveIcon}></Icon>
    </Button>
    <Button class="btn-icon" on:click={handle_query}>
        <Icon data={playIcon}></Icon>
    </Button>
</Toolbar>

<div class="youi-custom-query flex">
    <div class="query-nav">
        {#each steps as step,index}
            <div class="query-step flex hover-container" class:active={activeStepId==step.id}>
                <div class="step-header">
                    <div class="step-line"></div>
                    <span class="step-icon">
                        <Icon data={findIcon(step.name)}></Icon>
                    </span>
                    <Dropdown>
                        <DropdownToggle tag="span" class="hover-item step-btn-add">
                            <Icon scale={index===steps.length-1?1.2:0.8} data={plusIcon}></Icon>
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each ALL_STEPS as stepInfo,infoIndex}
                                <DropdownItem on:click={()=>openStepAdd(stepInfo,index)}>{stepInfo.text}</DropdownItem>
                                {#if infoIndex==4}
                                    <DropdownItem divider />
                                {/if}
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div class="step-main flex-1">
                    <div class="step-text flex-1" on:click={()=>showStep(step)}>
                        {step.text}
                    </div>
                </div>
            </div>
        {/each}
    </div>

    <div class="query-config flex-1 flex-column">
        <div style="height: 240px;overflow: auto;padding:6px;display: flex;">
            <slot></slot>
        </div>
        <div class="flex flex-1" style="border-top:1px solid #dddddd;width:100%;overflow: auto;">
            <textarea style="width: 100%;"> {queryScript}</textarea>
        </div>
        <div style="border-top:1px solid #dddddd;height:300px;overflow: auto;width:100%;">
            <div>
                <table class="table">
                    {#each rows as row}
                        <tr>
                            {#each Object.keys(row) as key}
                                <td class="cell">
                                    {row[key]||''}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </table>
            </div>
        </div>
    </div>
</div>

<Offcanvas width="90%" isOpen={openStepAdding} toggle={()=>openStepAdding=!openStepAdding}  placement="end" header={currentAddingStep?(currentAddingStep.name=='select'?currentAddingStep.text:('增加新步骤：'+currentAddingStep.text)):''}>
    {#if openStepAdding}
        {#if currentAddingStep.name == 'select'}
            <SelectCreator bind:csvPath={selectCsvPath} bind:headerColumns={selectColumns}></SelectCreator>
        {:else if currentAddingStep.name == 'filter'}
            <FilterCreator></FilterCreator>
        {:else if currentAddingStep.name == 'join'}
            <JoinCreator></JoinCreator>
        {:else if currentAddingStep.name == 'addcol' && currentAddingStep.addedColumn}
            <AddColumnCreator {...currentAddingStep} bind:expression={currentAddingStep.addedColumn.expression}></AddColumnCreator>
        {/if}
    {/if}
    <div style="position: absolute;right:20px;bottom:20px;">
        <Button color="primary" on:click={()=>{
            addNewStep(currentAddingStep,currentAddingIndex);
            openStepAdding=false;
        }}>确认</Button>
        <Button on:click={()=>openStepAdding=false}>取消</Button>
    </div>
</Offcanvas>

<style>
    .youi-custom-query{
        height: 100%;
        border-top: 1px solid #dddddd;
    }

    .query-nav{
        padding: 8px;
        border-right: 1px solid #dddddd;
        width:180px;
        overflow: auto;
    }

    .query-step{
        height: 80px;
        position: relative;
    }

    .step-header{
        width:32px;
        position: relative;
    }

    .query-step.active .step-text{
        color: red;
    }

    .step-main{
        margin-left: -16px;
    }

    .step-line{
        width: 2px;
        top: 0;
        bottom: 0;
        left: 15px;
        position: absolute;
        background-color:#e1e2ef;
    }

    .step-icon{
        display: inline-block;
        width:32px;
        height: 32px;
        text-align: center;
        font-size: 18px;
        background:#e1e2ef;
        border-radius: 16px;
        cursor: pointer;
        position: relative;
    }

    .step-text{
        padding-left: 20px;
        flex: 1;
        border: 1px solid #e1e2ef;
        line-height: 30px;
        vertical-align: middle;
        border-radius: 2px;
        cursor: pointer;
    }

    .step-text:hover{
        background: #e1e2ef;
    }

    table{
        empty-cells: show;
        collapse: true;
    }

    .cell{
        min-width: 60px;
        max-width: 200px;
        white-space: nowrap;
        border: 1px solid #ddd;
        overflow: hidden;
    }
</style>
