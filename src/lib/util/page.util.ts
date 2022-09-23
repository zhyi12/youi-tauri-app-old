import type {ConfigItem} from "../app-entity/base/config";

/**
 *
 * @param appConfig
 */
export function getConfigValue(appConfig:Map<string,ConfigItem>,name:string,default_value?:string){
    const item:ConfigItem|undefined = appConfig.get(name);
    if(item){
        if(item.value === 0) return 0;
        return item.value || default_value;
    }
    return default_value;
}