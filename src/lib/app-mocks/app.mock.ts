/**
 * 模拟数据
 */
import {dev,browser} from "$app/environment";
import {mockIPC} from "../tauri/mocks";
import {SQL_AREA_FIND_GEO_JSON} from "../app-dao/base/area.sql";
import {findAreaGeoJson} from "./base/area.mock";
import {mockFsMetadatas} from "./base/fs.mock";
import {FIND_BY_GROUP_SQL} from "../app-dao/dmp/customQuery.sql";
import {findCustomQuery} from "./dmp/query.mock";

let mocked = false;

export const init_mock_data = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!mocked && dev && browser && !window.__TAURI_METADATA__){
        mocked = true;
        return mockIPC((cmd, args)=>{
            console.log(cmd)
            switch (cmd){
                case 'plugin:sql|select':
                    return mockDbSelect(args);
                case 'plugin:fs-extra|metadatas':
                    return mockFsMetadatas(args);
                default:
                    console.log(cmd+JSON.stringify(args));
                    return "{}"
            }
        });
    }
}

/**
 *
 * @param args
 */
function mockDbSelect(args: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const values:Array<string> = args.values;
    switch (args.query){
        case SQL_AREA_FIND_GEO_JSON:
            return findAreaGeoJson(values[0]);
        case FIND_BY_GROUP_SQL:
            return findCustomQuery(values[0]);
        default:
            return {};
    }

    return [];
}