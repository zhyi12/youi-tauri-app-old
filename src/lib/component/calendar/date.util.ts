import type {Dayjs} from "dayjs";
import dayjs from "dayjs";
import {toNDate} from "./lunar.util";

export const WEEKLY_TEXTS = ["日","一","二","三","四","五","六"];

export type MonthDay = {
    day:Dayjs,
    isToday?:boolean,
    ndata?:any//农历数据
}

export function monthGridData(year:number,month:number,ndata?:boolean):MonthDay[][]{
    const grid:MonthDay[][] = [];

    const today = dayjs();
    const date = dayjs().year(year).month(month).hour(0).minute(0).second(0).millisecond(0);

    const days = date.daysInMonth();
    const startDay = date.date(0).day();//月头天所在周的day
    const endDay = date.date(date.daysInMonth()-1).day();//月尾天所在周的day

    const rows = findCurrentMonthRows(days,startDay);
    let startDate = 1;

    for(let i=0;i<rows;i++){
        const rowDays:MonthDay[] = [];
        for(let j=0;j<7;j++){
            let rowDay:MonthDay;
            if(i==0 && startDay!=6 && (j<6 && j<startDay+1)){
                //第一行处理，
                const prevMonthDate = date.date(0).subtract(startDay-j,'day');
                rowDay={day:prevMonthDate};
            }else if(i==rows-1 && endDay===6 && j>0){
                //
                const nextMonthDate = date.date(date.daysInMonth()-1).add(j+1,'day');
                rowDay = {day:nextMonthDate};
            }else if(i==rows-1 && endDay<6 && j>endDay+1){
                const nextMonthDate = date.date(date.daysInMonth()-1).add(j-endDay,'day');
                rowDay = {day:nextMonthDate};
            }else{
                //
                rowDay = {
                    day:date.year(date.year()).month(date.month()).date(startDate),
                    isToday:today.year() == date.year() && today.month() == date.month() && startDate == dayjs().date(),
                };
                startDate++;
            }
            if(ndata){
                rowDay.ndata = toNDate(rowDay.day.year(),rowDay.day.month(),rowDay.day.date());
            }
            rowDays.push(rowDay);
        }
        grid.push(rowDays);
    }

    if(rows < 7){
        //补充行
        const lastDay = grid[rows-1][6].day;
        let step = 1;
        for(let i=0;i<6-rows;i++){
            const rowDays:MonthDay[] = [];
            for(let j=0;j<7;j++){
                const rowDay:MonthDay = {
                    day:lastDay.add(step++,'day')
                };
                if(ndata){
                    rowDay.ndata = toNDate(rowDay.day.year(),rowDay.day.month(),rowDay.day.date());
                }
                rowDays.push(rowDay);
            }
            grid.push(rowDays);
        }
    }

    return grid;
}



/**
 *
 * @param days
 * @param startDay
 */
function findCurrentMonthRows(days:number,startDay:number) {
    let rows;
    if(startDay === 6 ){
        rows = Math.ceil(days/7);
    }else{
        rows = 1+Math.ceil((days - (6-startDay))/7);
    }
    return rows;
}