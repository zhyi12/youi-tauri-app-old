
import type { LayoutLoad ,LayoutLoadEvent} from './$types';
import {findAppMenus} from "$lib/app-services/base/menuServices";
import type {MenuInfo} from "$lib/app-entity/base/menu";
import {parseActiveModule} from "$lib/menu/menu.util";
import {findAppConfig} from "$lib/app-services/base/configServices";

//build时可删除，避免打包模拟数据
import {dev,browser} from "$app/environment";
import {init_mock_data} from "$lib/app-mocks/app.mock";


let app_menus:Array<MenuInfo> = [];

/**
 * 初始化数据加载
 */
export const load: LayoutLoad = async ({url,params}:LayoutLoadEvent) => {
    //build时可删除，避免打包模拟数据
    if(browser && dev){
        await init_mock_data();
    }

    if(!app_menus.length){
        //防止重复加载数据
        const loaded_app_menus = await findAppMenus();
        app_menus = loaded_app_menus;
    }

    const menus:Array<MenuInfo> = app_menus;

    //从url中识别当前模块
    const activeModule = parseActiveModule(url,params);

    //加载app配置信息
    const appConfig = await findAppConfig();

    return {
        menus,
        activeModule,
        appConfig
    }
}

