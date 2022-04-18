import {mockDataManager} from "../lib/youi/mock/data";
import {dmpDbList} from "./dmp-db";
import {customDsList} from "./custom-ds";
import {SQL_SELECT_ALL} from "../services/dmp/database/entity";
import {SQL_CUSTOM_DS_SELECT_ALL} from "../services/dmp/custom-ds/entity";


export function mockRegister(){

    mockDataManager.register(SQL_SELECT_ALL,dmpDbList);
    mockDataManager.register(SQL_CUSTOM_DS_SELECT_ALL,customDsList);

}