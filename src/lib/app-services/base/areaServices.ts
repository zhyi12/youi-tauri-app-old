/********************************************************************
 * 行政区划服务
 *******************************************************************/

import {
    SQL_AREA_FIND_BY_PARENT, SQL_AREA_FIND_GEO_BUILDING,
    SQL_AREA_FIND_GEO_JSON,
} from "../../app-dao/base/area.sql";

import {appDataBase} from "../../tauri/tauri.sql";
import type {AreaGeoJson} from "../../app-entity/base/area";
//
/**
 * 获取行政区划本级geo json数据
 */
export const findAreaGeoJson = async(areaId:string) => {
    return _findGeoJson(SQL_AREA_FIND_GEO_JSON,areaId);
}

/**
 * 获取区域建筑物
 * @param areaId
 */
export const findAreaGeoBuilding = async(areaId:string) => {
    return _findGeoJson(SQL_AREA_FIND_GEO_BUILDING,areaId);
}

/**
 *
 * @param areaId
 */
export const findChildren = async (areaId:string)=>{
    const result = await appDataBase.select(SQL_AREA_FIND_BY_PARENT,[areaId]);
    return result;
}

/**
 *
 * @param sql
 * @param areaId
 */
async function _findGeoJson(sql:string,areaId:string){
    const result:Array<AreaGeoJson> = await appDataBase.select(sql,[areaId]);
    console.log('load area result')
    if(result && result.length){
        const geo_json = result[0].geo_json;
        if(geo_json){
            return JSON.parse(geo_json);
        }
    }
    return {features:[]};
}
