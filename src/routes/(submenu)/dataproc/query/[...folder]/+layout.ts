import type {LoadEvent} from '@sveltejs/kit';
/**
 *
 * @param parent
 * @param params
 */
export async function load({parent,params}:LoadEvent) {

    const folder:string|undefined = params.folder == 'top' ?'':params.folder;

    //使用本地文件存储查询

    return {
        folder
    }

}