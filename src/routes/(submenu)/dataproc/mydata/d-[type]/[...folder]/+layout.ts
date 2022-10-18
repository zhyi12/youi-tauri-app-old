
import type { LayoutLoad } from './$types';
import type {ConfigItem} from "$lib/app-entity/base/config";
import type {Metadata} from "$lib/tauri/tauri.fs";
import {metadatas} from "$lib/tauri/tauri.fs";

const TYPES:Record<string,string> = {"all":"我的数据","pivotable":"透视表","query":"自助查询",
    "chart":"图表","etl":"数据清洗",report:"报表"};
const POSTFIXES:Record<string,string> = {"pivotable":"ypvt","query":"yqry","chart":"ycht","etl":"yetl","report":"yrpt"};

export const load: LayoutLoad = async ({parent,params}) => {
    const appContext = await parent();
    const folder = params.folder === 'top'?'':params.folder;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const appConfig:Map<string,ConfigItem> = appContext.appConfig;

    const dataDir:ConfigItem|undefined = appConfig.get("dataDir");

    let baseDir = '';
    let folderPath = '';
    let folderUri= '';
    let items:Metadata[] = [];
    //获取文件夹信息
    if(dataDir){
        baseDir = `${dataDir.value}/我的数据/`;
        folderPath = `${baseDir}${folder}`;
        folderUri = `/dataproc/mydata/d-${params.type}/${folder}`;
        items = await metadatas(folderPath);
        if(POSTFIXES[params.type]){
            items = items.filter(item=>item.isDir||item.name.endsWith('.'+POSTFIXES[params.type]));
        }
    }
    //
    return {
        type:params.type,
        typeCaption:TYPES[params.type],
        baseDir,
        folderPath,
        folderUri,
        folder,
        items
    };

}