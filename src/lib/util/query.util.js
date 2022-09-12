
/**
 * 获取指定查询步骤的输出列
 * @param steps
 * @param step
 */
export function parseOutColumns(steps, step){
    let outColumns = [];
    if(step.name === 'reader' || step.name === 'select'){
        outColumns = step.columns
            .filter(({name})=>step.selectedColumns.includes(name))
            .map(column=>({...column,id:column.name,property:column.name,caption:column.text}));
    }else if(step.name === 'filter' || step.name === 'sort'){
        return parsePrevStepOutColumns(steps,step.id);
    }else if(step.name ==='join'){
        //
        let prevOutColumns =  parsePrevStepOutColumns(steps,step.id);
        let rights = step.joinColumns.map(({right})=>right);
        outColumns = outColumns.concat(prevOutColumns.map(column=>({...column,property:column.name,caption:column.name})));
        outColumns = outColumns.concat(step.columns.filter(column=>!rights.includes(column.id))
            .map(column=>({...column,id:column.name+'_right',name:column.name+'_right',
                property:column.name+'_right',text:column.name+'_right',caption:column.name+'_right'})));
    }else if(step.name === 'agg' && Array.isArray(step.groups) && Array.isArray(step.measureItems)){
        //
        outColumns = step.groups.map(group=>({
            id:group.name,
            property:group.name,
            caption:group.name
        }));

        outColumns = outColumns.concat(step.measureItems.map(item=>({
            id:item.name+'_'+item.aggregate,
            property:item.name+'_'+item.aggregate,
            caption:item.name+'_'+item.aggregate,
        })));
    }else if(step.name === 'union'){
        outColumns = mergeUnionColumns(step.columns,step.unions);
    }
    return outColumns;
}

/**
 *
 * @param steps
 * @param stepId
 */
export function parsePrevStepOutColumns(steps,stepId) {
    let cursor = '';
    let outColumns = [];
    for(let i=steps.length-1;i>=0;i--){
        let curStep = steps[i];
        if(cursor === 'current'){
            if(curStep.name ==='filter' || curStep.name ==='sort'){
                continue;
            }else if(curStep.name === 'calculator'){
                //outColumns.push();
            }else{
                outColumns = outColumns.concat(parseOutColumns(steps,curStep));
                break;
            }
        }
        if(curStep.id === stepId){
            cursor = 'current';
        }
    }

    return outColumns;
}



/**
 *
 * @param columns 原始列
 * @param unions 合并数据集合
 */
export function mergeUnionColumns(columns,unions){
    let mergedColumns = columns.filter(column=>column.name);
    let mergedNames = columns.map(({name})=>name);

    unions.forEach(({columns})=>{
        mergedColumns = mergedColumns.concat(columns.filter(({name})=>name && !mergedNames.includes(name)));
    });

    return mergedColumns.map(column=>({...column,property:column.name,caption:column.name}));
}