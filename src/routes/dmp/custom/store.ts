import { writable } from 'svelte/store';
import type {Writable} from "svelte/store";

type JoinColumn = {
    name:string,
    left:string,
    right:string
}

export type Step = {
    id:string,
    name:string,
    reader?:string,
    uri?:string,
    text?:string,
    tableName?:string,
    columns?:Array<any>,
    selectedColumnNames?:Array<string>,
    filters?:[],
    joinTable?:string,
    joinType?:string,
    joinColumns?:Array<JoinColumn>,
    groups?:Array<any>,
    measureItems?:Array<any>,
    addedColumn?:any
}

export interface StepStore extends Writable<Array<Step>>{
    updateStep(step:Step),
    insertStep(step:Step,index:number)
}

export const stepStore:StepStore = buildCustomQueryStore();

/**
 *
 * @param steps
 */
export function buildCustomQueryStore():StepStore{
    const store = writable<Array<Step>>([]);

    /**
     *
     * @param step
     */
    function updateStep(step:Step) {
        store.update(steps=>{
            steps = steps.map(curStep=>{
                if(step.id == curStep.id){
                    return step;
                }
                return curStep;
            });
            return steps;
        })
    }

    function insertStep(step:Step,index:number){
        store.update(steps=>{
            return steps.splice(index,-1,step);
        });
    }

    return {
        updateStep,
        insertStep,
        ...store
    };

}