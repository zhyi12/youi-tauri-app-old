import type {CustomQuery} from "../../app-entity/dmp/customQuery";
import {appDataBase} from "../../tauri/tauri.sql";
import {FIND_BY_GROUP_SQL} from "../../app-dao/dmp/customQuery.sql";

/********************************************************************
 * 自助查询服务
 *******************************************************************/

/**
 *
 * @param groupName
 */
export async function findCustomQuery(groupName:string|unknown):Promise<Array<CustomQuery>>{
    const result =  await appDataBase.select<Array<CustomQuery>>(FIND_BY_GROUP_SQL,[groupName]);

    return result;
}