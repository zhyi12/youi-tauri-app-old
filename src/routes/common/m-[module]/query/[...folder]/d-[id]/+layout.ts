import type {LoadEvent} from "@sveltejs/kit";
import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

export async function load({parent,params}:LoadEvent) {
    const steps:Array<StepInfo> = [{
        id:"step001",
        text:"读数据",
        name:"reader",
        reader:"read_csv",
        uri:"/test.csv",
        columns:[]
    },{
        id:"step002",
        text:"选字段",
        name:"select",
        columns:[],
        selectedColumns:[]
    },{
        id:"step003",
        text:"过滤",
        name:"filter",
    }];

    const baseUri = `/common/m-${params.module}/query/${params.folder}/d-${params.id}`;

    return {
        baseUri,
        id:params.id,
        steps
    }
}