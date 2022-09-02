import type {LoadEvent} from '@sveltejs/kit';
import type { CustomQuery } from '$lib/app-entity/dmp/customQuery';
import {findCustomQuery} from "$lib/app-services/dmp/customQueryServices";

/**
 *
 * @param parent
 * @param params
 */
export async function load({parent, params}: LoadEvent) {
    const folder: string | undefined = params.folder == 'top' ? '' : params.folder;
    const module: string | unknown = params.module;
    let queryList: CustomQuery[] = [];
    if(module){
        const foundQueryList = await findCustomQuery(module);
        queryList = foundQueryList;
    }
    //使用本地文件存储查询
    return {
        folder,
        queryList,
        module:params.module
    }

}