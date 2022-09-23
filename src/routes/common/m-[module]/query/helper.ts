import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

/**
 *
 * @param steps
 * @param id
 */
export const findActiveIndex = (steps:StepInfo[],id:string) => {
    //
    for(let i=0;i<steps.length;i++){
        if(id === steps[i].id){
            return i;
        }
    }
    return -1;
}