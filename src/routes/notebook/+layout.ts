import type { LayoutLoad ,LayoutLoadEvent} from './$types';
import type {Metadata} from "$lib/tauri/tauri.fs";

import {getConfigValue} from "$lib/util/page.util";
import {metadatas} from "$lib/tauri/tauri.fs";

/**
 *
 * @param parent
 */
export const load: LayoutLoad = async ({parent}:LayoutLoadEvent) => {
    const appContext = await parent();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const {appConfig} = appContext;
    const dataDir = getConfigValue(appConfig,"dataDir");
    const baseUri = `/notebook`;
    let activeLabel = '';
    let notebookDir = '';

    let noteFolders:Metadata[] = [];//
    if(dataDir){
        notebookDir = `${dataDir}/我的笔记`;
        //
        noteFolders = await metadatas(notebookDir);
        noteFolders.sort((a,b)=>-a.name.localeCompare(b.name));
        if(noteFolders.length){
            activeLabel = noteFolders[0].name;
        }
    }

    return {
        notebookDir,
        noteFolders,
        baseUri,
        activeLabel
    }
}