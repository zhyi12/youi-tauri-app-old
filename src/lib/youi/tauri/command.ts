import {invoke} from "@tauri-apps/api/tauri";
import {is_tauri_app} from "./utils";

/**
 *
 * @param path
 */
export async function read_csv(path): Promise<any>{
    if(!is_tauri_app()){
        let result = [];
        let groups = ["A001","A002","A003"];
        for(let i=0;i<100;i++){
            let groupIndex = Math.ceil(Math.random()*1000)%3;
            result.push({"id":'I'+i+'_',"地(区、市、州、盟)":groups[groupIndex],"项目名称":"G0"+i,"计划总投资":Math.ceil(Math.random()*100)/10});
        }
        return result;
    }
    const json_str = await invoke("read_csv",{"invokeMessage":path});
    return JSON.parse(json_str.toString());
}

/**
 *
 * @param path
 */
export async function walk_data_file(path): Promise<String[]>{
    if(!is_tauri_app()){
        return ['/data','/data/test.csv','/data1','/data1/test.csv'];
    }
    const json_str = await invoke("walk_data_file",{"invokeMessage":path});
    return JSON.parse(json_str.toString());
}

/**
 *
 * @param script
 */
export async function exec_df_script(script):Promise<any>{
    if(!is_tauri_app()){
        return  [{"地(区、市、州、盟)":"直辖市","项目名称_count":6},{"地(区、市、州、盟)":"市辖","项目名称_count":12},{"地(区、市、州、盟)":"长寿区","项目名称_count":4},{"地(区、市、州、盟)":"黔江","项目名称_count":6},{"地(区、市、州、盟)":"璧山","项目名称_count":5},{"地(区、市、州、盟)":"县","项目名称_count":127},{"地(区、市、州、盟)":"市辖区","项目名称_count":953},{"地(区、市、州、盟)":"两江新区","项目名称_count":8},{"地(区、市、州、盟)":"涪陵区","项目名称_count":3},{"地(区、市、州、盟)":"区","项目名称_count":9},{"地(区、市、州、盟)":"江津区","项目名称_count":4},{"地(区、市、州、盟)":"垫江","项目名称_count":8},{"地(区、市、州、盟)":"永川","项目名称_count":22},{"地(区、市、州、盟)":"合川","项目名称_count":22},{"地(区、市、州、盟)":"市直辖","项目名称_count":1},{"地(区、市、州、盟)":"渝北区","项目名称_count":19},{"地(区、市、州、盟)":"梁平","项目名称_count":9},{"地(区、市、州、盟)":"大足区","项目名称_count":4},{"地(区、市、州、盟)":"万州区","项目名称_count":7},{"地(区、市、州、盟)":"直管区","项目名称_count":1},{"地(区、市、州、盟)":"万州","项目名称_count":8},{"地(区、市、州、盟)":"万盛经开区","项目名称_count":2},{"地(区、市、州、盟)":"北碚区","项目名称_count":1},{"地(区、市、州、盟)":"丰都","项目名称_count":2},{"地(区、市、州、盟)":"忠","项目名称_count":1},{"地(区、市、州、盟)":"南岸","项目名称_count":5},{"地(区、市、州、盟)":"市","项目名称_count":18},{"地(区、市、州、盟)":"江北","项目名称_count":10},{"地(区、市、州、盟)":"九龙坡区","项目名称_count":3},{"地(区、市、州、盟)":"大渡口区","项目名称_count":1},{"地(区、市、州、盟)":"渝北两江新区","项目名称_count":1},{"地(区、市、州、盟)":"江津","项目名称_count":7},{"地(区、市、州、盟)":"长寿","项目名称_count":7},{"地(区、市、州、盟)":"巴南区","项目名称_count":29},{"地(区、市、州、盟)":"双桥","项目名称_count":1},{"地(区、市、州、盟)":"璧山区","项目名称_count":5},{"地(区、市、州、盟)":"南川","项目名称_count":7},{"地(区、市、州、盟)":"荣昌区","项目名称_count":1},{"地(区、市、州、盟)":"沙坪坝区","项目名称_count":8},{"地(区、市、州、盟)":"云阳","项目名称_count":2},{"地(区、市、州、盟)":"巫山","项目名称_count":1},{"地(区、市、州、盟)":"铜梁区","项目名称_count":7},{"地(区、市、州、盟)":"黔江区","项目名称_count":5},{"地(区、市、州、盟)":"重庆市","项目名称_count":195},{"地(区、市、州、盟)":"沙坪坝","项目名称_count":5},{"地(区、市、州、盟)":"永川区","项目名称_count":7},{"地(区、市、州、盟)":"巴南","项目名称_count":12},{"地(区、市、州、盟)":"江北区","项目名称_count":9},{"地(区、市、州、盟)":"渝中区","项目名称_count":7},{"地(区、市、州、盟)":"大渡口","项目名称_count":7},{"地(区、市、州、盟)":"开州区","项目名称_count":4},{"地(区、市、州、盟)":"大足","项目名称_count":15},{"地(区、市、州、盟)":"忠县","项目名称_count":1},{"地(区、市、州、盟)":"南川区","项目名称_count":1},{"地(区、市、州、盟)":"重庆","项目名称_count":437},{"地(区、市、州、盟)":"渝北","项目名称_count":9},{"地(区、市、州、盟)":"铜梁","项目名称_count":13},{"地(区、市、州、盟)":"潼南区","项目名称_count":1},{"地(区、市、州、盟)":"彭水县","项目名称_count":1},{"地(区、市、州、盟)":"0","项目名称_count":4},{"地(区、市、州、盟)":"綦江","项目名称_count":4},{"地(区、市、州、盟)":"137","项目名称_count":1},{"地(区、市、州、盟)":"北部新区","项目名称_count":2},{"地(区、市、州、盟)":"九龙坡","项目名称_count":3},{"地(区、市、州、盟)":"涪陵","项目名称_count":14},{"地(区、市、州、盟)":"x","项目名称_count":1},{"地(区、市、州、盟)":"开州","项目名称_count":4},{"地(区、市、州、盟)":"直辖区","项目名称_count":16},{"地(区、市、州、盟)":"南岸区","项目名称_count":12},{"地(区、市、州、盟)":"北碚","项目名称_count":3},{"地(区、市、州、盟)":"梁平区","项目名称_count":2},{"地(区、市、州、盟)":"秀山","项目名称_count":2},{"地(区、市、州、盟)":"綦江区","项目名称_count":10},{"地(区、市、州、盟)":"合川区","项目名称_count":11},{"地(区、市、州、盟)":"渝中","项目名称_count":1},{"地(区、市、州、盟)":"垫江县","项目名称_count":3}];
    }
    const json_str = await invoke("df_script",{"invokeMessage":script});
    return JSON.parse(json_str.toString());
}

export function parse_columns(row):Array<any>{
    let keys = Object.keys(row);
    return  keys.map(key=>({name:key,id:key,text:key,dataType:(typeof row[key] == 'number')?'number':'text'}));
}