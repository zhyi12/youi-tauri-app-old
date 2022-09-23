import type {LoadEvent} from "@sveltejs/kit";
import {readFile} from "$lib/tauri/tauri.fs";
import {execute} from "$lib/tauri/tauri.dsl";
import type {Dimension,MeasureItem} from "$lib/component/cube/DataCube";
import {parseFolder} from "$lib/util/filename.util";

const NEW_TMP_NAME = '.new_pivotable';

export async function load({params,parent}:LoadEvent) {

    const parentData = await parent();
    const file = params.file||'';
    const folder = parseFolder(file||'')||'top';//
    const dataDir = parentData.appConfig.get("dataDir");

    let folderPath = '';//本地文件夹路径
    let filePath = '';//本地文件路径
    let reader = '';
    let uri = '';
    let columns = [];
    let rowDimensions:Dimension<any>[] = [];
    let colDimensions:Dimension<any>[] = [];
    let measureItems:MeasureItem[] = [];
    const isNewFile = file.endsWith(NEW_TMP_NAME);

    if(dataDir){
        const baseDir = `${dataDir.value}/我的数据`;
        filePath = `${baseDir}/${file}`;
        //在文件路径中解析文件夹路径
        folderPath = parseFolder(filePath);
        //读取本地文件内容
        const content = await readFile(filePath);
        //
        const result = JSON.parse(content);

        reader = result.reader;
        uri = result.uri;
        rowDimensions = result.rowDimensions;
        colDimensions = result.colDimensions;
        measureItems = result.measureItems;

        if(Array.isArray(result.columns) && result.columns.length>0){
            columns = result.columns;
        }else if(result.reader && result.uri){
            //
            const script = `${result.reader}_header("${result.uri}")`;
            const headers:[] = await execute(script);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            columns = headers.map(header=>({...header,text:header.name,id:header.name}));
        }
    }

    return {
        module:params.module,
        isNewFile,
        filePath,
        file,
        folderPath,
        folder,
        reader,
        uri,
        columns,
        rowDimensions,
        colDimensions,
        measureItems
    }
}