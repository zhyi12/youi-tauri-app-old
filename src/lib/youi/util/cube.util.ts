/**
 * 构建 polars dataframe 执行脚本
 * @param path
 * @param groupDimensions
 * @param measureItems
 */
export function buildDfScript(path,groupDimensions,measureItems){
    let script = ['let result = readCsv("'+path+'")'];

    let groupNames = groupDimensions.filter(({name})=>name!='measure').map(({name})=>name);
    let colExprs = measureItems.map(measureItem=>({name:measureItem.name,aggregate:measureItem.aggregate}));

    let aggParam = {group_names:groupNames,col_exprs:colExprs};
    let agg_param_script = JSON.stringify(aggParam).replace(/{/g,'#{');

    script.push('.agg('+agg_param_script+');');

    script.push('result');

    return script.join('');
}

export type Item = {
    id:string,
    dimId:string,
    text:string,
    name:string,
}
/**
 *
 */
export type MeasureItem = {
    name:string,
    text:string,
    aggregate:string
}
/**
 * 立方体
 */
export declare type Cube = {
    rowDimensions:Array<Dimension>,
    colDimensions:Array<Dimension>,
    measureItems:Array<MeasureItem>
}

export type Dimension = {
    id:string,
    name:string,
    text:string,
    type?:string,
    items:Array<Item>,
    itemValues?:Set<string>
}

export type RowData = {
    [key: string]: any
}

export type CubeCellKey = {
    items:Array<Item>
}
/**
 *
 * @param rowDimensions
 * @param colDimensions
 * @param measureItems
 * @param dfRowDataList
 */
export function buildTableData({rowDimensions,colDimensions,measureItems}:Cube,dfRowDataList:Array<RowData>){
    if(rowDimensions.length>0 && colDimensions.length==0){
        let items = measureItems.map(measureItem=>({
            id:measureItem.name+'_'+measureItem.aggregate,
            text:measureItem.text
        } as Item));

        colDimensions.push({
            id:'measure',
            items, name: "measure", text: "数值"
        });
    }

    let dimensionList = _findDimensionList({rowDimensions,colDimensions,measureItems});

    let rowDataMap = _fillDimensionItemsAndBuildRowDataMap(dfRowDataList,dimensionList,measureItems);

    let fullRowDimensions = dimensionList.filter(dimension=>dimension.type==='row');
    let fullColDimensions = dimensionList.filter(dimension=>dimension.type==='col');

    //行单元格
    let rowCrossItems = expandDimensionsItem(fullRowDimensions);
    //列单元格
    let colCrossItems = expandDimensionsItem(fullColDimensions);

    return _buildCrossTableData(fullRowDimensions.length,fullColDimensions.length,rowCrossItems,colCrossItems,rowDataMap);
}

/**
 *
 * @param rowCrossItems
 * @param colCrossItems
 * @param rowDataMap
 */
function _buildCrossTableData(rowDimensionCount,colDimensionCount,rowCrossItems,colCrossItems,rowDataMap){
    let data = [];
    let cols = rowDimensionCount+colCrossItems.length;

    for(let i=0;i<colDimensionCount;i++){
        let row = [];
        for(let j=0;j<cols;j++){
            if(j<rowDimensionCount){
                row.push('');
            }else{
                let item = colCrossItems[j-rowDimensionCount][i];
                row.push(item.text);
            }
        }
        data.push(row);
    }

    rowCrossItems.forEach(crossItem=>{
        let row = [];

        crossItem.forEach(item=>{
            row.push(item.text);
        });

        colCrossItems.forEach(colCrossItem=>{
            let items = [].concat(crossItem).concat(colCrossItem);
            let dataKey = _buildDataKey({items});
            let data = rowDataMap[dataKey];
            if(data || data ===0 ){
                row.push(data)
            }else{
                row.push('');
            }
        })

        data.push(row);
    })

    return data;
}


function _findDimensionList({rowDimensions,colDimensions}:Cube):Array<Dimension>{
    //
    let dimensionList = rowDimensions.map(dimension=>({
        itemValues:new Set(),
        items:[],
        ...dimension,
        type:'row'
    } as Dimension));
    //
    dimensionList = dimensionList.concat(colDimensions.map(dimension=>({
        itemValues:new Set(),
        items:[],
        ...dimension,
        type:'col'
    } as Dimension)));

    return dimensionList;
}

function _fillDimensionItemsAndBuildRowDataMap(dfRowDataList,dimensionList,measureItems){
    let rowDataMap = {};
    //
    dfRowDataList.forEach(rowData=>{
        let groupKeyItems = [];
        dimensionList.forEach(dimension=>{
            let value = rowData[dimension.name];
            if(dimension.name !== 'measure' && value ){
                dimension.itemValues.add(value);
                groupKeyItems.push({
                    id:value,
                    dimId:dimension.id
                });
            }
        });
        //
        measureItems.forEach(measureItem=>{
            let measureId = measureItem.name+'_'+measureItem.aggregate;
            let data = rowData[measureId];
            let items = [].concat(groupKeyItems);
            items.push({
                id:measureId,
                dimId:'measure'
            });

            rowDataMap[_buildDataKey({items})] = data;
        })
    });

    dimensionList.forEach(dimension=>{
        if(!dimension.items.length && dimension.itemValues.size){
            dimension.itemValues.forEach((value=>{
                dimension.items.push({id:value,text:value});
            }));
        }
    })

    return rowDataMap;
}

/**
 *
 * @param dimensions
 */
function expandDimensionsItem(dimensions:Array<Dimension>){
    let crossItems = [],headerItems=[],
        dimensionCount = dimensions.length,
        columns = 1,
        spans = 1,
        spansList = [];

    //计算占位
    for (let i = dimensions.length; i > 0; i--) {
        if (i < dimensions.length) {
            spans = spans * (dimensions[i].items.length);
        }
        spansList.push(spans);
        columns = columns * dimensions[i - 1].items.length;
    }

    dimensions.forEach((dimension,index)=>{
        for (let i = 0; i < columns; i++) {
            let spans = spansList[dimensionCount - index - 1],
                itemIndex = Math.floor(i / spans) % dimension.items.length,
                item = dimension.items[itemIndex];
            crossItems[i] = crossItems[i]||([].concat(headerItems));
            crossItems[i].push({
                ...item,
                dimId: dimension.id,
                spans:spans,
                itemCount:dimension.items.length});
        }
    });

    return crossItems;
}

/**
 *
 * @param items
 */
function _buildDataKey({items}:CubeCellKey):string{
    return items.map(item=>item.dimId+'_'+item.id).sort().join('|');
}