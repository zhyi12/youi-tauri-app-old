import Database from "./tauri-sql";
import {mockDataManager} from "../mock/data";

let database = null;

/**
 * dev模式下模拟数据库处理
 */
const mock_database = {
    async select<T>(query: string, bindValues?: unknown[]): Promise<T> {
        return new Promise((resolve,reject) => {
            let value = mockDataManager.get(query);
            return resolve(value);
        });
    }
} as Database;

/**
 *
 */
export async function findDatabase() {
    if (database) {
        return database;
    }

    if (window && window['__TAURI_IPC__']){
        const db = await Database.load('sqlite:app-config.db');
        database = db;
    }else{
        database = mock_database;
    }

    return database;
}


