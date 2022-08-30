import {findAppMenus} from "$lib/app-services/base/menuServices";
import type {MenuInfo} from "$lib/app-entity/base/menu";

/**
 * 初始化数据加载
 */
export async function load() {

    const menus:Array<MenuInfo> = await findAppMenus();

    return {
        menus
    }
}