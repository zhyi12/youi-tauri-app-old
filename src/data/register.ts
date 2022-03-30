import {mockDataManager} from "../lib/youi/mock/data";
import {dmpDbList} from "./dmp-db";
import {SQL_SELECT_ALL} from "../services/dmp/database/entity";

export function mockRegister(){

    mockDataManager.register(SQL_SELECT_ALL,dmpDbList);

}