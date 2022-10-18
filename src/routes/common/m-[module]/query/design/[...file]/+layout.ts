
import type {LoadEvent} from '@sveltejs/kit';
import {readFile} from "$lib/tauri/tauri.fs";
import {getConfigValue} from "$lib/util/page.util";

import type {StepInfo} from "$lib/app-entity/dmp/customQuery";
import {parseFolder} from "$lib/util/filename.util";

/**
 *
 * @param parent
 * @param params
 */
export async function load({parent, params}: LoadEvent) {
    //自助查询包id
    const appContext = await parent();

    const dataDir = getConfigValue(appContext.appConfig,"dataDir","");
    const filePath =  dataDir+'/我的数据/'+params.file;
    const baseUri = `/common/m-${params.module}/query/design/${params.file}`;
    const folder = parseFolder(params.file||'')||'top';

    let steps:StepInfo[] = [];
    const isNewQuery = params.file && params.file.endsWith('.create');//是否为新查询
    if(isNewQuery){
        steps = [{id:'step001',text:'读数据',name:'reader',reader:'read_csv'}];
    }else{
        const content = await readFile(filePath);
        if(content){
            steps = JSON.parse(content)
        }
    }

    return {
        module:params.module,
        folder,
        filePath,
        steps,
        baseUri,
        isNewQuery
    }

}