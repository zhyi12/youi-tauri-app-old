const CUBE_META_BG_COLOR = '#eeecec';

/**
 * 构建 polars dataframe 执行脚本
 * @param path
 * @param groupDimensions
 * @param measureItems
 */
export function buildDfScript(path,groupDimensions,measureItems,filters){
    let script = ['let result = read_csv("'+path+'")'];

    //build filter script
    let filterScript = buildFiltersScript(filters);

    if(filterScript){
        script.push(".filter(")
        script.push(filterScript);
        script.push(')');
    }

    let groupNames = groupDimensions.filter(({name})=>name!='measure').map(({name})=>name);
    let colExprs = measureItems.map(measureItem=>'col("'+measureItem.name+'").'+measureItem.aggregate+'().alias("'+measureItem.name+'_'+measureItem.aggregate+'")');

    //aggregate pipeline
    script.push('.agg("'+groupNames.join()+'",exprs(['+colExprs.join()+']))');
    //sort by group names
    script = script.concat(groupNames.map(name=>('.sort("'+name+'",false)')));
    script.push(';');
    script.push('\nresult');

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
    measureItems:Array<MeasureItem>,
    filters:Array<any>
}

export type Dimension = {
    id:string,
    name:string,
    text:string,
    type?:string,
    items:Array<Item>,
    itemValues?:Set<string>
}

export type Filter = {
    name:string,
    property:string,
    text:string,
    type:string,
    children:Array<Filter>
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
export function buildTableData({rowDimensions,colDimensions,measureItems,filters}:Cube,dfRowDataList:Array<RowData>){
    let measureDimensions = [].concat(rowDimensions).concat(colDimensions).filter(dimension=>dimension.name =='measure');
    let measureDimension;
    if(measureDimensions.length){
        measureDimension = measureDimensions[0];
    }else{
        measureDimension = {id:'measure',name:'measure',text:'数值',items:[],type:'col'};
        colDimensions.push(measureDimension);
    }

    measureDimension.items = measureItems.map(measureItem=>({
        id:measureItem.name+'_'+measureItem.aggregate,
        text:measureItem.text
    } as Item));

    let dimensionList = _findDimensionList({rowDimensions,colDimensions,measureItems,filters});

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
                row.push({text:'',fill:CUBE_META_BG_COLOR});
            }else{
                let item = colCrossItems[j-rowDimensionCount][i];
                row.push({text:item.text,fill:CUBE_META_BG_COLOR,style:{align:'center'}});
            }
        }
        data.push(row);
    }

    rowCrossItems.forEach(crossItem=>{
        let row = [];

        crossItem.forEach(item=>{
            row.push({text:item.text,fill:CUBE_META_BG_COLOR});
        });

        colCrossItems.forEach(colCrossItem=>{
            let items = [].concat(crossItem).concat(colCrossItem);
            let dataKey = _buildDataKey({items});
            let data = rowDataMap[dataKey];
            if(data || data ===0 ){
                row.push({
                    text:data,
                    fill:'white',
                    style:{
                        align:'right'
                    }
                });
            }else{
                row.push({
                    fill:'white',
                    text:''
                });
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
            if(data || data === 0){
                rowDataMap[_buildDataKey({items})] = data;
            }

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

export function buildFiltersScript(filters:Array<Filter>){
    let rootConn = filters[0];
    return _buildConnScript(rootConn)
}

function _buildConnScript(conn){
    let {name} = conn;
    let script = [];
    if(conn.children && conn.children.length>0){

        for(let i=0;i<conn.children.length;i++){
            let child = conn.children[i];

            if(child.type == 'cond' && !child.property){
                continue;
            }

            if(i>0){
                script.push("."+name+"(")
            }

            if(child.type == 'cond'){
                script.push('col("'+child.property+'").')
                script.push(child.operator||'eq');
                script.push('(');
                script.push('expr("'+child.value+'")');
                script.push(')');
            }else if(child.type=='conn'){
                script.push(_buildConnScript(child));
            }

            if(i>0){
                script.push(")")
            }
        }
    }

    return script.join('');
}