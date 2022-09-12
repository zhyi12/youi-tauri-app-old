import type {Column, Condition, StepInfo,Reader} from "$lib/app-entity/dmp/customQuery";

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
 * 聚合类型
 */
export const AGG_LIST = [{text:'计数',name:'count'},
    {text:'求和',name:'sum',numberOnly:true},
    {text:'平均值',name:'mean',numberOnly:true},
    {text:'最大值',name:'max'},
    {text:'最小值',name:'min'},
];
/**
 * 字符字段的可用聚合类型
 */
export const STR_AGG_LIST = AGG_LIST.filter(({numberOnly})=>!numberOnly);

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
        if(!node.name && !node.property){
            return;
        }
        levelConditions.push({id:node.id,name:node.name,property:node.property,level:level,text:node.text,
            dataType:node.dataType,type:node.type,value:node.value,operator:node.operator||'eq'});
        if(Array.isArray(node.children)){
            levelConditions = levelConditions.concat(flattenFilters(node.children,level+1));
        }
    })

    return levelConditions;
}

/**
 *
 * @param columns 原始列
 * @param unions 合并数据集合
 */
export function buildMergedRows(columns:Column[],unions:Reader[]){

    const rows = [];
    //
    let mergedColumns:Column[] = columns.filter(column=>column.name);
    let mergedNames = columns.map(({name})=>name);

    unions.forEach(({columns})=>{
        mergedColumns = mergedColumns.concat(columns.filter(({name})=>name && !mergedNames.includes(name)));
        mergedNames = mergedColumns.map(({name})=>name);
    });

    rows.push({
        text:'合并结果',
        columns:mergedColumns
    });

    //输入列
    rows.push({
        text:'输入列',
        columns:columns.filter(column=>column.name)
    });

    unions.forEach(({uri,columns},index)=>{
        const unionColumnMap = new Map();
        columns.forEach((column,index)=>unionColumnMap.set(column.name,index));

        const unionColumns:Column[] = mergedColumns.map(column=>{
            const unionColumn = unionColumnMap.get(column.name);
            if(unionColumn>-1){
                return columns[unionColumn];
            }else{
                return {id:'',name:'',text:''};
            }
        });

        rows.push({
            text:uri.replace(/.+\//,''),
            columns:unionColumns
        });
    });

    return rows;
}