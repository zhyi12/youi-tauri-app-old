import {appDataBase} from "../../tauri/tauri.sql";
import {SQL_CONFIG_SELECT} from "../../app-dao/base/config.sql";
import type {ConfigItem} from "../../app-entity/base/config";

/**
 *
 */
export const findAppConfig  = async():Promise<Map<string, ConfigItem>> => {
    const configs = await appDataBase.select<ConfigItem[]>(SQL_CONFIG_SELECT,[]);

    const appConfig = new Map();
    if(Array.isArray(configs)){
        configs.forEach(configItem=>{
            appConfig.set(configItem.name,configItem);
        });
    }
    return appConfig;
}