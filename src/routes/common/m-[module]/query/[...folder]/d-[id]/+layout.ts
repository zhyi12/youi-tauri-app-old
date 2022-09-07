import type {LoadEvent} from "@sveltejs/kit";
import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

export async function load({parent,params}:LoadEvent) {

    let steps:Array<StepInfo>;
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
        steps = [{
            id:"step001",
            text:"读数据",
            name:"reader",
            reader:"read_csv",
            uri:"/Volumes/D/data/local/年度数据/data.csv",
            columns:[{name:'id',text:'id',dataType:'str'},{name:'code',text:'code',dataType:'str'},{name:'group',text:'group',dataType:'str'}],
            selectedColumns:["id","code","group"]
        },{
            id:"step002",
            text:"选字段",
            name:"select",
            columns:[{name:'id',text:'id',dataType:'str'},{name:'code',text:'code',dataType:'str'},{name:'group',text:'group',dataType:'str'}],
            selectedColumns:["id","code","group"]
        },{
            id:"step003",
            text:"过滤",
            name:"filter",
            conditions:[{"id":"root","name":"and","text":"且","type":"conn","operator":"eq",children:[{"id":"f01","name":"","property":"group","text":"group","type":"cond","value":"G02","operator":"eq"}]}]
        },{
            "id":"step004","text":"排序","name":"sort","orders":[{"property":"code","descending":true}]
        },{
            "id":"step005","text":"左右连接","name":"join","reader":"read_csv",
            "uri":"/Volumes/D/data/local/年度数据/data_join.csv",
            joinHow:'left',
            "joinColumns":[{"left":"id","right":"id","name":"id"}]
        }
        ];
    }

    const baseUri = `/common/m-${params.module}/query/${params.folder}/d-${params.id}`;

    return {
        baseUri,
        id:params.id,
        steps
    }
}