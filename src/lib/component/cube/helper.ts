
import type {CrossItem, Dimension, Item} from "./DataCube";

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
 *
 * @param dimensions
 */
export function expandDimensionsItem(dimensions:Dimension<any>[]){
    const crossItems:CrossItem[] = [],headerItems:Item[]=[],
        dimensionCount = dimensions.length,
        spansList:number[] = [];
    let columns = 1,spans = 1;


    //计算占位
    for(let i = dimensions.length; i > 0; i--) {
        if (i < dimensions.length) {
            spans = spans * (dimensions[i].items.length);
        }
        spansList.push(spans);
        columns = columns * dimensions[i - 1].items.length;
    }

    dimensions.forEach((dimension,index)=>{
        for (let i = 0; i < columns; i++) {
            const spans = spansList[dimensionCount - index - 1],
                itemIndex = Math.floor(i / spans) % dimension.items.length,
                item = dimension.items[itemIndex];

            crossItems[i] = crossItems[i]||({items:headerItems.map(item=>({...item}))});
            crossItems[i].items.push({
                ...item,
                dimId: dimension.id,
                spans:spans,
                first:i%spans === 0,
                itemCount:dimension.items.length});
        }
    });
    return crossItems;
}

/**
 * 转 echarts dataset
 * @param rowDataList
 */
export function buildDataset(rowDataList:[]):{source:[]}{
    const source = [];

    if(rowDataList.length>0){
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const firstRow:object = rowDataList[0];
        const keys = Object.keys(firstRow);

        for(let j=0;j<keys.length;j++){
            source.push([keys[j]]);
        }

        for(let i=0;i<rowDataList.length;i++){
            for(let j=0;j<keys.length;j++){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const value = rowDataList[i][keys[j]];
                source[j].push(value);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {source};
}