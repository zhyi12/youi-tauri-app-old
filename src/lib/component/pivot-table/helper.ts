import type {CrossItem, MeasureItem, SpanItem, Dimension, Item} from "../cube/DataCube";
import type {Area, CellData} from "../data-grid/DataGrid";
import {expandDimensionsItem} from "../cube/helper";

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

    if(colCrossItems.length>1){
        colCrossItems.forEach((crossItem,columnIndex)=>{
            crossItem.items.forEach((item,rowIndex)=>{
                if(item.first && item.spans && item.spans>1){
                    mergedCells.push({
                        startRow:rowIndex,
                        startCol:columnIndex+frozenColumns,
                        endRow:rowIndex,
                        endCol:columnIndex+frozenColumns+item.spans-1
                    });
                }
            });
        });
    }
    return mergedCells;
}

/**
 * @param rowDimensions
 * @param colDimensions
 * @param measureItems
 */
export function expendTableCross(rowDimensions:Dimension<any>[],colDimensions:Dimension<any>[],measureItems:MeasureItem[]) {
    const rowCrossItems = expandDimensionsItem(rowDimensions);
    let colCrossItems:CrossItem[];

    if(measureItems.length === 0){
        colCrossItems = [];
    }else if(measureItems.length===1 && colDimensions.length > 0){
        colCrossItems = expandDimensionsItem(colDimensions);
    }else{
        colCrossItems = expandDimensionsItem(colDimensions.map(dim=>({...dim}))
            .concat([{"id":"measure",name:'measure',text:'值',items:measureItems.map(item=>({...item})) }]));
    }

    return {rowCrossItems,colCrossItems};
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function fillFrozenRowData(dataMap, rowCrossItems: CrossItem[], frozenRows: number) {
    rowCrossItems.forEach((crossItem,rowIndex)=>{
        crossItem.items.forEach((item,columnIndex)=>{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dataMap[[rowIndex+frozenRows,columnIndex]] = {text:item.text,align:isMergeSpanItem(item)?'center':'left'};
        })
    });
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function fillFrozenColumnData(dataMap, colCrossItems: CrossItem[], frozenColumns: number) {
    colCrossItems.forEach((crossItem,columnIndex)=>{
        crossItem.items.forEach((item,rowIndex)=>{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dataMap[[rowIndex,columnIndex+frozenColumns]] = {text:item.text,align:'center'};
        });
    });
}

/**
 *
 * @param items
 */
function buildCrossKey(items: Item[]) {
    const keys = items.map(({id,dimId})=>`${dimId}.${id}`);
    keys.sort();
    return keys.join('|');
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function fillRowData(dataMap,rowDataList: [], series: { name: string; values: [] }[],
                     rowCrossItems: CrossItem[], colCrossItems: CrossItem[],
                     frozenRows: number,
                     frozenColumns: number) {
    //分组列名集合
    const groupNames = series.map(({name})=>name);

    const rowDataMap:Record<string,any> = {};
    rowDataList.forEach(rowData=>{
        const groupItems:Item[] = groupNames.map(name=>({dimId:name,id:rowData[name],text:'',name:name}));
        Object.keys(rowData).filter(key=>!groupNames.includes(key)).forEach(name=>{
            const items:Item[] = groupItems.map(item=>({...item}));
            const value = rowData[name];
            items.push({
                id:name,text:'',dimId:'measure',name:''
            });
            const crossKey = buildCrossKey(items);
            rowDataMap[crossKey] = value;
        });
    });

    rowCrossItems.forEach((rowCrossItem,rowIndex)=>{
        colCrossItems.forEach((colCrossItem,columnIndex)=>{
            let items:Item[] = [];
            items = items.concat(rowCrossItem.items).concat(colCrossItem.items);
            const crossKey = buildCrossKey(items);
            const value = rowDataMap[crossKey];

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dataMap[[rowIndex+frozenRows,columnIndex+frozenColumns]] = {text:value,align:'right'};
        })
    })
}

/**
 *
 * @param rowDimensions
 * @param colDimensions
 * @param cubeRowDataList
 */
export function buildTableData(
    rowDimensions:Dimension<any>[],
    colDimensions:Dimension<any>[],
    measureItems:MeasureItem[],
    cubeData:{rowDataList:[],series:{name:string,values:[]}[]}){

    const tableRowDimensions = rowDimensions.map(dimension=>({...dimension}));
    const tableColDimensions = colDimensions.map(dimension=>({...dimension}));

    if(cubeData){
        const {series} = cubeData;

        if(series.length){
            tableRowDimensions.forEach(dimension=>{
                const group =  series.filter(({name})=>name === dimension.name);
                if(group.length){
                    const groupItems = group[0].values.map(value=>({
                        id:value,
                        name:value,
                        text:value
                    }));
                    dimension.items = groupItems;
                }
            });

            tableColDimensions.forEach(dimension=>{
                const group =  series.filter(({name})=>name === dimension.name);
                if(group.length){
                    const groupItems = group[0].values.map(value=>({
                        id:value,
                        name:value,
                        text:value
                    }));
                    dimension.items = groupItems;
                }
            });

        }
    }

    const {rowCrossItems,colCrossItems} = expendTableCross(tableRowDimensions,tableColDimensions,measureItems);
    //
    //
    const dataMap = {};
    let frozenColumns = 0;
    let frozenRows = 1;

    if(rowCrossItems.length){
        frozenColumns = rowCrossItems[0].items.length;
    }

    if(colCrossItems.length){
        frozenRows = colCrossItems[0].items.length;
    }

    if(frozenRows){
        //填充行表头
        fillFrozenRowData(dataMap,rowCrossItems,frozenRows);
        //填充列表头
        fillFrozenColumnData(dataMap,colCrossItems,frozenColumns);

        if(cubeData){
            const {rowDataList,series} = cubeData;
            fillRowData(dataMap,rowDataList,series,rowCrossItems,colCrossItems,frozenRows,frozenColumns);
        }
        //数据
        //
    }

    const rows = frozenRows + rowCrossItems.length;
    const columns = frozenColumns + colCrossItems.length;

    const mergedCells = findMergedCells(frozenRows,frozenColumns,rowCrossItems,colCrossItems);

    return {dataMap,rows,columns,frozenRows,frozenColumns,mergedCells};
}

const isMergeSpanItem = (item:SpanItem):boolean|undefined|number => {
    return item.first && item.spans && item.spans > 1;
}

