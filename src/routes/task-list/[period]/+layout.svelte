<script lang="ts">
    import {setContext} from "svelte";
    import {afterNavigate,goto} from "$app/navigation";
    import dayjs from "dayjs";

    import {Button, Icon, Nav, NavItem} from "$lib/youi/index";
    import {rightIcon, leftIcon} from "$lib/app-icon";
    import {findSchedules, updateSchedule} from "$lib/app-services/schedule/scheduleServices";

    import {CONTEXT_NAME, parseTimeTitle, TIME_PERIOD_LIST} from "../helper";

    import YearSchedule from '../component/_YearSchedule.svelte';
    import MonthSchedule from '../component/_MonthSchedule.svelte';
    import WeeklySchedule from '../component/_WeeklySchedule.svelte';
    import DaySchedule from '../component/_DaySchedule.svelte';

    import type {Schedule} from "$lib/app-entity/schedule/schedule";

    const comps = {
        year: YearSchedule,
        month: MonthSchedule,
        weekly: WeeklySchedule,
        day: DaySchedule
    };

    /**
     * 数据
     * {
     *     period,
     *     year,
     *     month,
     *     date
     * }
     */
    export let data;

    let year = data.year;
    let month = data.month;
    let date = data.date;

    let scheduleList = [];

    let periodComponent = undefined;

    let container: HTMLElement = undefined;
    let contentWidth = 1000;

    $:title = parseTimeTitle(data.period, year, month, date);

    setContext(CONTEXT_NAME,{
        openDialog:(name,x,y,formRecord)=>{
            if(formRecord.id){
                if(x+300 > contentWidth){
                    x = contentWidth - 300;
                }
                goto(`/task-list/${data.period}/dialog/${x}-${y}/${name}-${formRecord.id}`);
            }
        },

        updateSchedule:(schedule:Schedule)=>{
            if(schedule.id){
                doUpdateSchedule(schedule);
            }
        }
    });

    const doUpdateSchedule = (schedule) => {
        updateSchedule(schedule).then(rowsAffected=>{
            if(rowsAffected){
                scheduleList = scheduleList.map(s=>{
                    if(s.id == schedule.id){
                        return schedule;
                    }
                    return {...s};
                })
            }
        })
    }

    const goPrev = () => {
        if ('year' === data.period) {
            year = year - 1;
        } else if ('month' === data.period) {
            month = month - 1;
            if (month < 0) {
                year = year - 1;
                month = 11;
            }
        } else if ('weekly' === data.period) {
            //
            const prevWeeklyDay = dayjs().year(year).month(month).date(date).subtract(7,'day');
            year = prevWeeklyDay.year();
            month = prevWeeklyDay.month();
            date = prevWeeklyDay.date();
        }
    }

    const goNext = () => {
        if ('year' === data.period) {
            year = year + 1;
        } else if ('month' === data.period) {
            month = month + 1;
            if (month > 11) {
                year = year + 1;
                month = 0;
            }
        } else if ('weekly' === data.period) {
            //
            const prevWeeklyDay = dayjs().year(year).month(month).date(date).add(7,'day');
            year = prevWeeklyDay.year();
            month = prevWeeklyDay.month();
            date = prevWeeklyDay.date();
        }
    }

    const today = () => {
        let currentDay = dayjs();
        year = currentDay.year();
        month = currentDay.month();
        date = currentDay.date();
    }

    const handle_resize = () => {
        contentWidth = container.offsetWidth - 2;
    }

    /**
     * 更新日历显示后事件
     *  1. 根据显示起始时间获取任务数据
     * @param detail
     */
    const schedules = async ({startTime,endTime}) => {
        const result = await findSchedules(startTime,endTime);
        return result;
    }

    afterNavigate(() => {
        periodComponent = comps[data.period];
        handle_resize();
    });

</script>

<svelte:window on:resize={handle_resize}></svelte:window>

<div class="content flex-column flex-1">
    <Nav class="nav-tabs">
        {#each TIME_PERIOD_LIST as period}
            <NavItem>
                <a class:active={data.period == period.id} href={`/task-list/${period.id}`}
                   class="nav-link">{period.text}</a>
            </NavItem>
        {/each}
    </Nav>

    <div class="flex-full content">
        <div class="flex-column content flex-1" bind:this={container}>
            <h3 class="date-title flex">
                <span>{title}</span>
                <div class="flex-1">
                    <Button class="btn-icon" on:click={()=>goNext()}>
                        <Icon data={rightIcon}></Icon>
                    </Button>
                    <Button class="btn-icon" on:click={()=>today()}>
                        今天
                    </Button>
                    <Button class="btn-icon" on:click={()=>goPrev()}>
                        <Icon data={leftIcon}></Icon>
                    </Button>
                </div>
            </h3>
            <svelte:component this={periodComponent} {year} {month} {date} width={contentWidth}
                              bind:scheduleList
                              {schedules}/>
        </div>
    </div>
</div>

<slot></slot>

<style lang="scss">
  .date-title {
    margin: 0px;
    padding: 6px;
  }
</style>

