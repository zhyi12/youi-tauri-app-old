/**
 *
 * @param parent
 * @param params
 */
import {readFile} from "$lib/tauri/tauri.fs";

import {getConfigValue} from "$lib/util/page.util";
import {parseFolder} from "$lib/util/filename.util";

import type {LoadEvent} from "@sveltejs/kit";
import type {Model} from "./model";

/**
 *
 * @param params
 */
export async function load({parent, params}: LoadEvent) {

    const appContext = await parent();

    const dataDir = getConfigValue(appContext.appConfig,"dataDir","");
    const filePath =  dataDir+'/我的数据/'+params.file;
    const baseUri = `/common/m-${params.module}/report/design/${params.file}`;
    const folder = parseFolder(params.file||'')||'top';

    const isNewReport = params.file && params.file.endsWith('.create');//是否为新查询

    let model:Model;
    if(isNewReport){
        model = {
            columns: [
                {id: 'I01',name:'I01', text: '生产总值', dataType: 'f64'},
                {id: 'I02',name:'I02', text: '登记注册类型', dataType: 'str'},
                {id: 'I03',name:'I03', text: '工业总产值', dataType: 'f64'},
                {id: 'I04',name:'I04', text: '数据处理地', dataType: 'str'},
            ]
        }
    }else{
        const content = await readFile(filePath);
        model = JSON.parse(content);
    }

    return {
        isNewReport,
        module: params.module,
        file: params.file,
        filePath,
        baseUri,
        folder,
        model
    }
}