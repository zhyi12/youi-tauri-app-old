import dayjs, {Dayjs} from 'dayjs';
import type {Schedule} from "$lib/app-entity/schedule/schedule";
import {monthGridData} from "$lib/component/calendar/date.util";

export const CONTEXT_NAME = 'Schedule';

export const DEFAULT_COLOR = '#CFBAE6';

const MILLISECONDS_A_DAY = 86400000;   //  24 * 3600 * 1000

export const WEEKLY_TEXTS = ["周日","周一","周二","周三","周四","周五","周六"];

export type ScheduleCell = {
    day:Dayjs,
    isToday?:boolean,
    ndata?:any//农历数据
    tasks?:DayTask[]
}

export type MonthData ={
    year:number,
    month:number,
    rows:number,
    grid:MonthDay[][]
}

export type Task = {
    id:string,
    startTime:number,
    endTime:number,
    text:string,
    color?:string
}

export type DayTask = {
    id?:string,
    startTime?:number,
    endTime?:number,
    text?:string,
    isStart?:boolean,
    isEnd?:boolean,
    color?:string,
    index?:number
}

export type MonthDay = {
    day:Dayjs,
    isToday?:boolean,
    ndata?:any//农历数据
}

export const TIME_PERIOD_LIST = [
    {id:'year',text:'年',format:'YYYY年'},
    {id:'month',text:'月',format:'YYYY年MM月'},
    {id:'weekly',text:'周',format:'YYYY年MM月'},
    {id:'day',text:'日',format:'YYYY年MM月DD日'},
]

/**
 *
 */
export function parseTimeTitle(period:string,year:number,month:number,date:number) :string{
    const {format} = TIME_PERIOD_LIST.filter(({id})=>id == period)[0];
    //
    return dayjs().year(year).month(month).date(date).format(format);
}

/**
 *
 * @param year
 * @param month
 */
export function parseMonthData(year:number,month:number):MonthData {
    const grid = monthGridData(year, month,true);

    return {
        year,
        month,
        rows:6,
        grid
    }
}

/**
 * @param monthData
 * @param schedules
 */
export function buildScheduleCells(monthData:MonthData,schedules:Schedule[]):ScheduleCell[][]{
    const scheduleCells:ScheduleCell[][] = [];
    //
    if(monthData.grid){
        //
        for(let i=0;i<monthData.rows;i++){
            scheduleCells[i] = [];
            for(let j=0;j<7;j++){
                const monthDay = monthData.grid[i][j];
                let tasks: { index: number; id?: string | undefined; startTime?: number | undefined; endTime?: number | undefined; text?: string | undefined; isStart?: boolean | undefined; isEnd?: boolean | undefined; color?: string | undefined; }[] = [];
                if(schedules.length){
                    tasks = schedules.map((schedule)=>findDaySchedule(monthDay,schedule))
                        .filter(task=>task.id!='').map((task,index)=>({...task,index}));
                }

                scheduleCells[i][j] = {...monthData.grid[i][j],tasks};
            }
            //按行调整task位置
            processTaskIndex(scheduleCells[i]);
        }
    }
    return scheduleCells;
}

/**
 * 按日历行调整任务显示顺序
 * @param rowDays
 */
function processTaskIndex(rowDays:ScheduleCell[]) {
    const taskIndexMap:Record<string, number> = {};
    for(let j=0;j<7;j++){
        const monthDay = rowDays[j];
        if(monthDay.tasks && monthDay.tasks.length){
            monthDay.tasks.forEach((task,index)=>{
                if(task.id){
                    taskIndexMap[task.id] = taskIndexMap[task.id]||0;
                    taskIndexMap[task.id] = Math.max(taskIndexMap[task.id],index);
                }
            });
        }
    }

    //
    for(let j=0;j<7;j++){
        const monthDay = rowDays[j];
        if(monthDay.tasks){
            monthDay.tasks.forEach((task)=>{
                if(task.id && (task.index || task.index == 0)){
                    task.index = Math.max(task.index,taskIndexMap[task.id]);
                }
            })
        }
    }
}

/**
 *
 * @param monthDay
 * @param schedule
 */
function findDaySchedule(monthDay:MonthDay,schedule:Schedule):DayTask {
    const dayStartTime = dayToTime(monthDay);
    const dayEndTime = dayStartTime+MILLISECONDS_A_DAY;
    //2022-10-12 00:00:00 day:1665504000000 - 1665590400000: task:1664553600000 - 1665590399000
    if(schedule.start_time && schedule.end_time &&
        dayStartTime>=schedule.start_time && (dayStartTime<=schedule.end_time || dayEndTime<=schedule.end_time)
    ){
        const isStart = schedule.start_time>=dayStartTime && schedule.start_time<=dayEndTime;

        const isEnd = schedule.end_time>=dayStartTime && schedule.end_time<dayEndTime;
        return {
            ...schedule,
            startTime:schedule.start_time,
            endTime:schedule.end_time,
            isStart,
            isEnd
        }
    }

    return {id:'',index:0};
}

export function dayToTime(monthDay:MonthDay):number{
    return monthDay.day.toDate().getTime();
}

/**
 * 计算反色,
 * @param {*} a 色值
 * @param {*} ilighten 减弱对比度(-1 ~ -15)
 * @returns
 * 示例: oppositeColor("#000000", -4); 返回: #bbbbbb
 */
export function oppositeColor(a:string, ilighten:number) {
    a = a.replace('#', '');
    //var max16 = 15;
    let max16 = Math.floor(15 + (ilighten || 0));
    if (max16 < 0 || max16 > 15) max16 = 15;

    let c16;
    let c10;
    const b = [];

    for (let i = 0; i < a.length; i++) {
        c16 = parseInt(a.charAt(i), 16); // to 16进制
        c10 = parseInt((max16 - c16)+'', 10); // 10进制计算
        if (c10 < 0) c10 = Math.abs(c10);
        b.push(c10.toString(16)); // to 16进制
    }
    return '#' + b.join('');
}