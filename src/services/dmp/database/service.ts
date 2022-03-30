import type { RequestHandler } from '@sveltejs/kit';
import {findDatabase} from "../../../lib/youi/sql/db-manager";
import {SQL_SELECT_ALL} from "./entity";

/**
 *
 *
 */
export const getDbList: RequestHandler = async (request) => {

    const db = await findDatabase();

    const result = await db.select(SQL_SELECT_ALL);

    return result;
}