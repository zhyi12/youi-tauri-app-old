import {invoke} from "./tauri";

/**
 *
 * @param script
 */
export async function execute<T>(script: string): Promise<T> {
    return await invoke<string>('plugin:dsl|execute', { script }).then((result) => {
        return JSON.parse(result);
    });
}

/**
 * 透视表查询
 * @param query
 */
export async function pivotTableQuery<T>(query: string): Promise<T> {
    return await invoke<string>('plugin:dsl|pivot_table_query', { query }).then((result) => {
        return JSON.parse(result);
    });
}

/**
 *
 * @param query json
 * @param pageIndex
 * @param pageSize
 */
export async function query<T>(query: string,pageIndex:number,pageSize:number): Promise<T> {
    return await invoke<string>('plugin:dsl|query', { query,pageIndex,pageSize }).then((result) => {
        return JSON.parse(result);
    });
}

export async function buildQueryScript(query: string): Promise<string> {
    return await invoke<string>('plugin:dsl|query_to_script', { query }).then((result) => {
        return result;
    });
}