<script lang="ts">

    import {setContext} from "svelte";
    import {is_function} from "svelte/internal";

    import {goto, afterNavigate} from "$app/navigation";

    import {Accordion, AccordionItem, Toolbar, Button, Icon, List, saveIcon} from "$lib/youi/index";
    import {saveFile} from "$lib/tauri/tauri.fs";
    import {pivotTableQuery} from "$lib/tauri/tauri.dsl";
    import Chart from "$lib/thirdpart/echart/Chart.svelte";
    import {backIcon, saveAsIcon} from "$lib/app-icon";
    import {APP_ICONS} from "$lib/app-icon/icons";

    import {CHART_DESIGN, CHART_TYPES, DIALOG_ADD, buildChartOption, DIALOG_DIMENSION_EDIT,DIALOG_MEASURE_EDIT} from "./helper";
    import ChartTypeSelector from '../component/_ChartTypeSelector.svelte';
    import DimensionSelector from '../component/_DimensionSelector.svelte';

    import type {EChartsOption} from "echarts";
    import type {DatasetOption} from "echarts/types/dist/shared";

    /**
     * layout.ts load 返回的数据 + 上级的返回数据
     */
    export let data;

    /**
     * 图表参数
     */
    let options:EChartsOption = undefined;

    /**
     * 数据模型
     */
    let model = Object.assign({
        chartConfig:{
            type:'bar',
            subType:'default',
        }
    },data.model);

    let dataset:DatasetOption = undefined;//数据集
    /**
     * 当前激活的图表类型
     */
    let activeChartType = CHART_TYPES.filter(({name})=>model.chartConfig.type)[0];

    let editingDimension = undefined;
    let editingMeasureItem = undefined;

    /**
     * 监听数据集变化、图表配置、维度集变化、指标集变化
     */
    $: if(dataset && model.chartConfig && model.rowDimensions && model.measureItems){
        options = buildChartOption(model.chartConfig,model.measureItems,model.rowDimensions,dataset);
    }

    setContext(CHART_DESIGN, {
        getFormRecord: (name) => {
            let formRecord = {};
            switch (name) {
                case DIALOG_ADD:
                    formRecord = {caption: '', folderPath: data.folderPath};
                    break;
                case DIALOG_DIMENSION_EDIT:
                    formRecord = {...editingDimension};
                    break;
                case DIALOG_MEASURE_EDIT:
                    formRecord = {...editingMeasureItem};
                    break;
                default:
                    break;

            }
            return formRecord
        },
        afterDialogSubmit: (name, formRecord) => {
            if (afterActions[name] && is_function(afterActions[name])) {
                afterActions[name](formRecord);
            }
        }
    });

    /**
     *
     */
    const afterActions = {
        add: async record => {
            //goto new file
            let filePath = `${record.folderPath}/${record.caption}.ycht`;
            let result = await saveFile(filePath, JSON.stringify(model));

            if (result && result.name) {
                await goto(`/common/m-${data.module}/chart/design/${data.folder}/${result.name}`);
            }
        },
        'dimension-edit':record=>{
            if(editingDimension){
                editingDimension.text = record.text;
                model.rowDimensions =   model.rowDimensions;
            }
        },
        'measure-edit':record=>{
            if(editingMeasureItem){
                editingMeasureItem.text = record.text;
                model.measureItems =   model.measureItems;
            }
        }
    }

    const save = async () => {
        if (data.isNewFile) {
            //
            openDialog(DIALOG_ADD);
        } else {
            //
            await doSave(data.filePath);
        }
    }

    const doSave = async (filePath) => {
        const result = await saveFile(filePath, JSON.stringify(model));
        if (result) {
            alert('保存成功.')
        }
    }

    /**
     * 执行查询
     */
    const doQuery = async () => {
        if (model.measureItems.length && model.rowDimensions.length > 0) {
            const queryJson = JSON.stringify({...model, colDimensions: []});

            const queryResult = await pivotTableQuery<{ rowDataList: [], series: [] }>(queryJson);

            const dimensions = queryResult.series.map(({name}) => name).concat(model.measureItems.map(({id}) => id));
            //数据集
            dataset = <DatasetOption>{
                dimensions,
                source:queryResult.rowDataList
            };
        }else{
            options = {};
            dataset = undefined;
        }
    }

    /**
     *
     * @param name
     */
    const openDialog = (name) => {
        goto(`/common/m-${data.module}/chart/design/${data.file}/dialog/${name}`);
    }

    afterNavigate(async () => {
        await doQuery();
    });

</script>
<div class="content flex-column flex-full">
    <Toolbar>
        <Button title="返回" href={`/${data.module}/mydata/d-chart/${data.folder}`}>
            <Icon data={backIcon}></Icon>
        </Button>
        <Button title="保存" on:click={()=>save()}>
            <Icon data={saveIcon}></Icon>
        </Button>
        <Button title="另存为">
            <Icon data={saveAsIcon}></Icon>
        </Button>

        <span style="padding-left: 30px;font-size: 0.9rem;">
            {#if data.isNewFile}
                <span style="color: green">(新图表)</span>
            {:else}
                路径：{data.filePath}
            {/if}
        </span>
    </Toolbar>
    <div class="content flex-row flex-full">
        <div class="page-left">
            {#if model && model.columns}
                <List icon={(item)=>APP_ICONS[item.dataType]} check={false} draggable={true}
                      bind:items={model.columns}></List>
            {/if}
        </div>
        <div class="flex-full content">
            <DimensionSelector bind:rowDimensions={model.rowDimensions}
                               bind:measureItems={model.measureItems}
                               on:dimension-editing={({detail})=>{
                                   editingDimension = detail;
                                   openDialog(DIALOG_DIMENSION_EDIT);
                               }}
                               on:measure-editing={({detail})=>{
                                   editingMeasureItem = detail;
                                   openDialog(DIALOG_MEASURE_EDIT);
                               }}
                               on:change={()=>doQuery()}
            />
            <Chart class={"flex-full inner-box"} bind:options/>
        </div>

        <div class="page-right">
            <Accordion class="no-border" stayOpen={true}>
                <AccordionItem header="图表类型" active={true}>
                    <ChartTypeSelector items={CHART_TYPES} bind:activeChartType bind:type={model.chartConfig.type}/>
                </AccordionItem>

                {#if activeChartType && activeChartType.children  && activeChartType.children.length}
                    <AccordionItem header={`${activeChartType.text}类型`} active={true}>
                        <ChartTypeSelector items={activeChartType.children} bind:type={model.chartConfig.subType}/>
                    </AccordionItem>
                {/if}

                <AccordionItem header="图表参数">

                </AccordionItem>
            </Accordion>
        </div>
    </div>
</div>
<slot>

</slot>

<style lang="scss">
  .content {
    background-color: #fafbfe;
  }

  .page-left {
    width: 240px;
    padding:8px;
    overflow-y:auto;
  }

  .page-right {
    width: 300px;
    border-left: 1px solid #dddddd;
  }
</style>