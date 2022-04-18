/**
 *
 * @param steps
 * @param step
 */
export const findStepColumns = (steps,step)=>{
    let findingStep = null;
    for(let i=steps.length-1;i>=0;i--){
        let curStep = steps[i];
        if(curStep.id == step.id){
            findingStep = curStep;
        }

        if(findingStep){
            if(Array.isArray(findingStep.columns)){
                return findStepOutColumns(findingStep);
            }
            if(i>0){
                findingStep = steps[i-1];
            }
        }
    }
}

function findStepOutColumns(step){
    let columns = [].concat(step.columns);

    if(step.selectedColumnNames && step.selectedColumnNames.length){
        columns = columns.filter(column=>step.selectedColumnNames.includes(column.name));
    }

    return columns;
}