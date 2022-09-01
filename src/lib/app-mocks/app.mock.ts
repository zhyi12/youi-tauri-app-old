/**
 * 模拟数据
 */
import {dev,browser} from "$app/environment";
import {mockIPC} from "../tauri/mocks";
import {SQL_AREA_FIND_GEO_JSON} from "../app-dao/base/area.sql";
import {findAreaGeoJson} from "./base/area.mock";

let mocked = false;

export const init_mock_data = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!mocked && dev && browser && !window.__TAURI_METADATA__){
        mocked = true;
        return mockIPC((cmd, args)=>{
            switch (cmd){
                case 'plugin:sql|select':
                    return mockDbSelect(args);
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
        default:
            return {};
    }

    return {};
}