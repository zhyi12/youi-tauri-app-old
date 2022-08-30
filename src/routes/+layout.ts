import {findAppMenus} from "$lib/app-services/base/menuServices";
import type {MenuInfo} from "$lib/app-entity/base/menu";
import {parseActiveModule} from "$lib/menu/menu.util";

/**
 * 初始化数据加载
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function load({url,params}) {
    const menus:Array<MenuInfo> = await findAppMenus();
    //从url中识别当前模块
    const activeModule = parseActiveModule(url,params);

    return {
        menus,
        activeModule
    }
}