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

export async function buildQueryScript(query: string): Promise<string> {
    return await invoke<string>('plugin:dsl|query_to_script', { query }).then((result) => {
        return result;
    });
}