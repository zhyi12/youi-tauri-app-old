import type {LoadEvent} from "@sveltejs/kit";
import {findSchedule} from "$lib/app-services/schedule/scheduleServices";

export async function load({params}:LoadEvent) {

    const {id} = params;

    if(id){
        //获取任务数据
        const schedule = await findSchedule(id||'');
        return {schedule};
    }

    return  {};
}