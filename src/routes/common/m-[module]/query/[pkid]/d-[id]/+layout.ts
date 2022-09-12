import type {LoadEvent} from "@sveltejs/kit";
import type {StepInfo} from "$lib/app-entity/dmp/customQuery";
import {findContent} from "$lib/app-services/dmp/customQueryServices";

export async function load({params}:LoadEvent) {

    let steps:Array<StepInfo> = [];
    if(params.id === 'create'){
        steps = [{
            id:"step001",
            text:"读数据",
            name:"reader",
            reader:"read_csv",
            uri:"",
            columns:[],
            selectedColumns:[]
        }]
    }else{
        if(params.id){
            const content:string|undefined = await findContent(params.id);
            if(content){
                steps = JSON.parse(content)
            }
        }
    }

    const baseUri = `/common/m-${params.module}/query/${params.folder}/d-${params.id}`;

    return {
        baseUri,
        id:params.id,
        steps
    }
}