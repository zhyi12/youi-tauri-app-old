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
    text:string,
    tableName?:string,
    columns?:[],
    selectedColumnNames?:Array<string>,
    filters?:[],
    joinTable?:string,
    joinType?:string,
    joinColumns?:Array<JoinColumn>
}

export interface StepStore extends Writable<Array<Step>>{
    updateStep(step:Step)
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

    return {
        updateStep,
        ...store
    };

}