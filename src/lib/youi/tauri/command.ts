import {invoke} from "@tauri-apps/api/tauri";
import {is_tauri_app} from "./utils";

/**
 *
 * @param path
 */
export async function read_csv(path): Promise<any>{
    if(!is_tauri_app()){
        return [{"id":1,"code":"A001","group":"G01"},{"id":2,"code":"A002","group":"G01"},{"id":3,"code":"A003","group":"G01"},{"id":4,"code":"A004","group":"G02"},{"id":5,"code":"A005","group":"G02"},{"id":6,"code":"A006","group":"G02"},{"id":7,"code":"A007","group":"G02"},{"id":8,"code":"A008","group":"G03"}];
    }
    const csv_json = await invoke("read_csv",{"invokeMessage":path});
    return JSON.parse(csv_json.toString());
}