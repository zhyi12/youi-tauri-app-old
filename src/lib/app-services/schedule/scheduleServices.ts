import {appDataBase} from "../../tauri/tauri.sql";

import {
    FIND_PERIOD_SCHEDULE_SQL,
    ADD_SCHEDULE_SQL,
    REMOVE_SCHEDULE_SQL,
    FIND_SCHEDULE_SQL, UPDATE_SCHEDULE_SQL
} from "../../app-dao/schedule/schedule.sql";
import type {Schedule} from "../../app-entity/schedule/schedule";

/**
 *
 * @param id
 */
export async function findSchedule(id:string):Promise<Schedule|undefined>{
    const result =  await appDataBase.select<Array<Schedule>>(FIND_SCHEDULE_SQL,[id]);
    return result.length?result[0]:undefined;
}

/**
 * 查找时间段内的日程
 * @param startTime
 * @param endTime
 */
export async function findSchedules(startTime:number,endTime:number,allDay?:number):Promise<Array<Schedule>>{
    let sql = FIND_PERIOD_SCHEDULE_SQL;
    const bindValues = [startTime,endTime];
    if(allDay!=null){
        sql += ' and all_day = $3';
        bindValues.push(allDay);
    }
    const result =  await appDataBase.select<Array<Schedule>>(FIND_PERIOD_SCHEDULE_SQL,bindValues);

    return result;
}

/**
 *
 * @param schedule
 */
export async function addSchedule(schedule:Schedule):Promise<string|number>{
    //id,text,all_day,start_time,end_time
    const result = await appDataBase.execute(ADD_SCHEDULE_SQL,[
        schedule.id,
        schedule.text,
        schedule.all_day,
        schedule.start_time,
        schedule.end_time,
        schedule.color
    ]);

    return result.lastInsertId;
}

/**
 *
 * @param schedule
 */
export async function updateSchedule(schedule:Schedule):Promise<number>{
    const result = await appDataBase.execute(UPDATE_SCHEDULE_SQL,[
        schedule.id,
        schedule.text,
        schedule.all_day,
        schedule.start_time,
        schedule.end_time,
        schedule.color
    ]);
    return result.rowsAffected;
}
/**
 *
 * @param id
 */
export async function removeSchedule(id:string):Promise<number>{
    const result = await appDataBase.execute(REMOVE_SCHEDULE_SQL,[id]);
    return result.rowsAffected;
}