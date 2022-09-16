import type {CrossItem, MeasureItem, SpanItem} from "../cube/DataCube";
import type {Area} from "../data-grid/DataGrid";

/**
 *
 */
export function findMergedCells(frozenRows:number,frozenColumns:number,rowCrossItems:CrossItem[],colCrossItems:CrossItem[]) :Area[]{
    const mergedCells:Area[] = [];
    if(frozenRows>1 || frozenColumns>1){
        mergedCells.push({
            startRow:0,startCol:0,endRow:Math.max(frozenRows-1,0),endCol:Math.max(frozenColumns-1,0)
        })
    }
    if(rowCrossItems.length>1){
        //
        rowCrossItems.forEach((crossItem,rowIndex)=>{
            crossItem.items.forEach((item,columnIndex)=>{
                if(item.first && item.spans && item.spans>1){
                    mergedCells.push({
                        startRow:rowIndex+frozenRows,startCol:columnIndex,
                        endRow:rowIndex+frozenRows+item.spans-1,
                        endCol:columnIndex
                    });
                }
            });
        });
    }
    return mergedCells;
}
/**
 *
 * @param rowDimensions
 * @param colDimensions
 * @param measureItems
 * @param cubeRowDataList
 */
export function buildDataMap(frozenRows:number,frozenColumns:number,
                             rowCrossItems:CrossItem[],
                             colCrossItems:CrossItem[],
                             measureItems:MeasureItem[],
                             cubeRowDataList:[]){
    //
    const dataMap = {};

    if(measureItems.length){
        //行表头
        rowCrossItems.forEach((crossItem,rowIndex)=>{
            crossItem.items.forEach((item,columnIndex)=>{
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                dataMap[[rowIndex+frozenRows,columnIndex]] = {text:item.text,align:isMergeSpanItem(item)?'center':'left'};
            })
        });
        //列表头
        colCrossItems.forEach((crossItem,columnIndex)=>{
            crossItem.items.forEach((item,rowIndex)=>{
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                dataMap[[rowIndex,columnIndex+frozenColumns]] = {text:item.text,align:'center'};
            });
        });
    }
    return dataMap;
}

const isMergeSpanItem = (item:SpanItem):boolean|undefined|number => {
    return item.first && item.spans && item.spans > 1;
}