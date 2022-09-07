import type {Condition, StepInfo} from "$lib/app-entity/dmp/customQuery";

export const QUERY_CONTEXT_NAME = "queryStep";

export const ALL_STEPS = [
    {name:'select',text:'选字段'},
    {name:'filter',text:'过滤'},
    {name:'calculator',text:'计算列'},
    {name:'split',text:'拆分列'},
    {name:'sort',text:'排序'},
    {name:'join',text:'左右连接'},
    {name:'union',text:'上下连接'},
    {name:'agg',text:'分组汇总'},
];

export const JOIN_TYPES = [{text:'左连接',name:'left'},{text:'内连接',name:'inner'},{text:'外连接',name:'outer'}];

/**
 * 构建自助查询的json串
 */
export function buildQueryJson(steps:StepInfo[]):string{
    //filters 转换，从树转层级列表
    const body = steps.map(step=>stepToJson({...step})).filter(s=>s).join(',');
    return `[${body}]`;
}

/**
 *
 * @param step
 */
function stepToJson(step:StepInfo):string{
    if(step.name === 'filter' && step.conditions){
        step.conditions = flattenFilters(step.conditions,0);
    }else if(step.name === 'sort'){
        if(!step.orders)return '';
        //删除未配置的order
        step.orders = step.orders.filter(order=>order.property);
        if(!step.orders.length)return '';
    }
    return JSON.stringify(step);
}

/**
 *
 * @param treeConditions
 * @param level
 */
function flattenFilters(treeConditions:Condition[],level:number):Condition[] {
    let levelConditions:Condition[] = [];
    treeConditions.forEach(node=>{
        levelConditions.push({id:node.id,name:node.name,property:node.property,level:level,text:node.text,
            dataType:node.dataType,type:node.type,value:node.value,operator:node.operator||'eq'});
        if(Array.isArray(node.children)){
            levelConditions = levelConditions.concat(flattenFilters(node.children,level+1));
        }
    })
    return levelConditions;
}