import type {CustomQuery} from "../../app-entity/dmp/customQuery";
import {appDataBase} from "../../tauri/tauri.sql";
import {FIND_BY_GROUP_SQL, FIND_CONTENT_SQL, INSERT_SQL, UPDATE_CONTENT} from "../../app-dao/dmp/customQuery.sql";

/********************************************************************
 * 自助查询服务
 *******************************************************************/

/**
 *
 * @param groupName
 */
export async function findCustomQuery(groupName:string|undefined):Promise<Array<CustomQuery>>{
    const result =  await appDataBase.select<Array<CustomQuery>>(FIND_BY_GROUP_SQL,[groupName]);

    return result;
}

/**
 *
 * @param id
 */
export async function findContent(id:string):Promise<string|undefined>{
    const result = await appDataBase.select<CustomQuery[]>(FIND_CONTENT_SQL,[id]);
    return result.length?result[0].content:undefined;
}

/**
 *
 * @param customQuery
 */
export async function insertCustomQuery(customQuery:CustomQuery):Promise<number>{
    const {name,caption,query_app,query_group,folder_path,content} = customQuery;
    const result = await appDataBase.execute(INSERT_SQL,[name,caption,query_app,query_group,folder_path,content]);
    return result.lastInsertId;
}

/**
 *
 * @param id
 * @param content
 */
export async function updateContent(id:string,content:string):Promise<number>{
    const result = await appDataBase.execute(UPDATE_CONTENT,[id,content]);
    return result.rowsAffected;
}