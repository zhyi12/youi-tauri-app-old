import type {LoadEvent} from "@sveltejs/kit";
import {readFile} from "$lib/tauri/tauri.fs";
import {parseFolder} from "$lib/util/filename.util";
import {getConfigValue} from "$lib/util/page.util";

const NEW_TMP_NAME = '.new_chart';

export async function load({params,parent}:LoadEvent) {
    const appContext = await parent();
    const dataDir = getConfigValue(appContext.appConfig,"dataDir","");
    const file = params.file||'';
    const folder = parseFolder(file||'')||'top';//
    const isNewFile = file.endsWith(NEW_TMP_NAME);

    let filePath = '';//本地文件路径
    let folderPath = '';//本地文件夹路径

    let model = {
        reader:'',
        uri:'',
        columns:[],
        rowDimensions:[],
        measureItems:[]
    }

    if(dataDir){
        const baseDir = `${dataDir}/我的数据`;
        filePath = `${baseDir}/${file}`;
        //在文件路径中解析文件夹路径
        folderPath = parseFolder(filePath);
        //读取本地文件内容
        const content = await readFile(filePath);
        //
        const result = JSON.parse(content);

        if(result){
            model = Object.assign(model,result);
        }
    }

    return {
        module:params.module,
        isNewFile,
        folderPath,
        folder,
        file,
        filePath,
        model
    }
}