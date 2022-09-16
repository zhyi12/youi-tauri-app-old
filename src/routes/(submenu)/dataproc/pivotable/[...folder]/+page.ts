
import type { PageLoad } from './$types';
import type {ConfigItem} from "$lib/app-entity/base/config";
import type {Metadata} from "$lib/tauri/tauri.fs";
import {metadatas} from "$lib/tauri/tauri.fs";

export const load: PageLoad = async ({parent,params}) => {
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
        baseDir = `${dataDir.value}/透视表/`;
        folderPath = `${baseDir}${folder}`;
        folderUri = `/dataproc/pivotable/${folder}`;
        items = await metadatas(folderPath);
    }
    //
    return {
        baseDir,
        folderPath,
        folderUri,
        folder,
        items
    };

}