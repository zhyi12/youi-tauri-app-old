
import {
    chartIcon,
    lineChartIcon,
    hBarChartIcon,
    areaChartIcon,
    towAxisChartIcon,
    pieChartIcon,
    radarChartIcon, funnelChartIcon
} from "$lib/app-icon";

import type {EChartsOption,SeriesOption} from "echarts";
import type {Dimension, MeasureItem} from "$lib/component/cube/DataCube";
import type {DatasetOption} from "echarts/types/dist/shared";
import type {RadarIndicatorOption} from "echarts/types/src/coord/radar/RadarModel";

export const DIALOG_CONTEXT_NAME = 'dialog_chart';
export const CHART_DESIGN = 'chart_design';

export const DIALOG_ADD = 'add';
export const DIALOG_SAVE_AS = 'saveas';
export const DIALOG_DIMENSION_EDIT = 'dimension-edit';
export const DIALOG_MEASURE_EDIT = 'measure-edit';

export const CHART_TYPES = [{
    name: "bar",
    text: "柱状图",
    icon: chartIcon,
    children:[{
        name: "default",
        text: "普通柱状图",
        icon: chartIcon,
    },{
        name: "stack",
        text: "堆积柱状图",
        icon: chartIcon,
    },{
        name: "percentageStack",
        text: "百分比堆积柱状图",
        icon: chartIcon,
    }]
}, {
    name: "hBar",
    text: "条形图",
    icon: hBarChartIcon,
    children:[{
        name: "default",
        text: "普通条形图",
        icon: hBarChartIcon,
    },{
        name: "stack",
        text: "堆积条形图",
        icon: hBarChartIcon,
    },{
        name: "percentageStack",
        text: "百分比堆积条形图",
        icon: hBarChartIcon,
    }]
}, {
    name: "line",
    text: "折线图",
    icon: lineChartIcon
}, {
    name: "pie",
    text: "饼图",
    icon: pieChartIcon,
    children:[{
        name: "default",
        text: "普通饼图",
        icon: pieChartIcon,
    },{
        name: "boldCircle",
        text: "粗圆环",
        icon: pieChartIcon,
    },{
        name: "thinkCircle",
        text: "细圆环",
        icon: pieChartIcon,
    }]
}, {
    name: "area",
    text: "面积图",
    icon: areaChartIcon
}, {
    name: "towAxis",
    text: "双轴图",
    icon: towAxisChartIcon
}, {
    name: "radar",
    text: "雷达图",
    icon: radarChartIcon
}, {
    name: "funnel",
    text: "漏斗图",
    icon: funnelChartIcon
}
];

type ChartConfig = {
    type:string,
    subType:string
}

/**
 * 构建echart option
 */
export function buildChartOption(chartConfig:ChartConfig,measureItems:MeasureItem[],rowDimensions:Dimension<any>[],dataset:DatasetOption):EChartsOption{

    let option = {};
    console.log('build chart option...')
    const baseOption:EChartsOption = {
        legend: {
            bottom: "1%"
        },
        tooltip: {},
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let series: SeriesOption[] = createSeries(chartConfig.type,measureItems);

    if(chartConfig.type === 'hBar'){
        option = {
            yAxis: {type: 'category'},
            xAxis: {type: 'value'},
        };
    } else if(chartConfig.type ==='pie'){
        option = {};
    } else if (chartConfig.type === 'radar'){
        option = buildRadarOption(measureItems,rowDimensions,dataset);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        series = option.series;
    } else if('towAxis' === chartConfig.type){
        option = {
            xAxis: {type: 'category'},
            yAxis: [{type:'value',position: 'left',name:''},{type:'value',position: 'right',name:''}]
        }
    } else{
        option = {
            xAxis: {type: 'category'},
            yAxis: {},
        }
    }

    return {
        ...baseOption,
        ...option,
        dataset,
        series
    };
}

/**
 *
 * @param chartType
 * @param measureItems
 */
export function createSeries(chartType:string,measureItems:MeasureItem[]) {

    if('bar' === chartType|| 'hBar' === chartType){
        return measureItems.map(measureItem=>(
            {
                type: 'bar',
                name:measureItem.text,
                barMaxWidth:48,
                itemStyle:{borderRadius: [5, 5, 0, 0]},
                label:{show:true}
            }
        ));
    }else if('line' === chartType || 'area' === chartType){
            return measureItems.map(measureItem=>({name:measureItem.text,type: 'line',label:{show:true,position: 'top'},areaStyle:'area' === chartType?{}:undefined}));
    }else if('pie' === chartType){
        return [{type:'pie',label:{show:true}}];
    }else if('towAxis' === chartType){
        return [
            {
                type: 'bar',
                name:measureItems[0].text,
                barMaxWidth:48,
                itemStyle:{borderRadius: [5, 5, 0, 0]},
                label:{show:true}
            },
            {
                type: 'line',
                name:measureItems[1].text,
                label:{show:true},
                yAxisIndex: 1,
            }
        ]
    }

    return [];

}

/**
 * 雷达图
 * @param measureItems
 * @param rowDimensions
 * @param dataset
 */
function buildRadarOption(measureItems: MeasureItem[],rowDimensions:Dimension<any>[], dataset: DatasetOption):EChartsOption {
    const option:EChartsOption = {
        radar: {
            indicator:undefined
        }
    };

    const names = new Set();
    const data: { value: any[]; }[] = [];
    const label = rowDimensions[0].name;

    if(rowDimensions.length === 1 && measureItems.length===1){
        //一个维度+1个指标
        const measureId = measureItems[0].id;
        const value: any[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dataset.source.forEach(row=>{
            names.add(row[label]);
            value.push(row[measureId]);
        });
        data.push({value});
    }else if(rowDimensions.length === 1 && measureItems.length>=3){
        //一个维度+大于3个指标

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dataset.source.forEach(row=>{
            names.add(row[label]);
            const props = Object.keys(row).filter(key=>key != label);
            props.forEach((prop,index)=>{
                data[index] = data[index]||{value:[],name:prop};
                data[index].value.push(row[prop]);
            })
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    option.radar.indicator = Array.from(names).map(name=>({name:name} as RadarIndicatorOption));
    option.series = {
        type: 'radar',
        data
    };

    return option;
}
