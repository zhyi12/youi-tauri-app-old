<!-- ***********************************************************************

    时间选择器

*************************************************************************-->

<script lang="ts">

    import type {MonthDay} from "./date.util";

    import {onMount} from "svelte";
    import dayjs from "dayjs";
    import {Icon,isNull} from "../../youi/index";
    import {leftIcon, rightIcon, todayIcon} from "../../app-icon";

    import {monthGridData} from "./date.util";

    export let value: string | number | dayjs.Dayjs = undefined;

    let currentDay:dayjs.Dayjs = undefined;
    let selectedDay:dayjs.Dayjs = undefined;

    /** 年份 */
    let year: number;
    /** 月份 从0开始 */
    let month: number;

    let grid: MonthDay[][] = [];

    $: if (value) {
        //
        let day: dayjs.Dayjs = undefined;
        const type = typeof value;
        switch (type) {
            case 'string':
                break;
            case 'number':
                break;
            case 'object':
                day = <dayjs.Dayjs>value;
                break;
            default:
                day = dayjs();
                break;
        }

        if (day) {
            //showMonthPanel(day.year(), day.month());
            currentDay = day;
        }
    }

    $: if(currentDay){
        showMonthPanel(currentDay.year(), currentDay.month());
    }

    const showMonthPanel = (theYear, theMonth) => {
        year = theYear;
        month = theMonth;
        if (year && !isNull(month)) {
            grid = monthGridData(year, month);
        }
    }

    /**
     *
     * @param day
     */
    const selectDay = (day:dayjs.Dayjs) => {
        selectedDay = day;
    }

    const goPrevMonth = () => {
        //selectedDay = null;
        currentDay = dayjs().year(year).month(month).subtract(1,'month');
    }

    const goNextMonth = () => {
        //selectedDay = null;
        currentDay = dayjs().year(year).month(month).add(1,'month');
    }

    onMount(() => {
        if (!value) {
            value = dayjs();
        }
    });
</script>

<div class="youi-datepicker">
    <div class="flex datepicker-header">
        <span class="btn-icon" on:click={()=>goPrevMonth()}>
            <Icon data={leftIcon}></Icon>
        </span>
        <div class="flex-1 flex">
            <div class="flex-1 center">{year}</div>
            <div class="flex-1 center">{month+1}</div>
        </div>
        <span class="btn-icon" on:click={()=>goNextMonth()}>
            <Icon data={rightIcon}></Icon>
        </span>
    </div>
    <div class="container month-panel">
        <div class="flex day-container weekly-header">
            <div class="day-header">日</div>
            <div class="day-header">一</div>
            <div class="day-header">二</div>
            <div class="day-header">三</div>
            <div class="day-header">四</div>
            <div class="day-header">五</div>
            <div class="day-header">六</div>
        </div>
        <div class="flex day-container">
            {#each grid as rowData}
                {#each rowData as cell}
                    <div class="day-cell col"
                         on:click={()=>selectDay(cell.day)}
                         class:selected={selectedDay && selectedDay.isSame(cell.day,'day')}
                         class:current-month={cell.day.month() == month}
                         class:today={cell.isToday}>
                        {cell.day.date()}
                    </div>
                {/each}
            {/each}
        </div>
    </div>
    <div>
        时
        分
        秒
        <span class="btn-icon" title="今天" on:click={()=>{
            currentDay = dayjs();
            selectedDay = currentDay;
        }}><Icon data={todayIcon}></Icon></span>
    </div>
</div>

<style lang="scss">
  .youi-datepicker {
    width: 321.875px;
    border-radius: 8px;
    border: 1px solid #dddddd;

    .center{
      text-align: center;
    }

    .btn-icon{
      width:20px;
      text-align: center;
      &:hover{
        background-color: #dddddd;
      }
    }

    .datepicker-header{
      padding-left: 10px;
      line-height: 32px;
    }

    .day-header {
      font-weight: bold;
    }

    .day-container{
      padding: 0;
      outline: 0;
      text-align: left;
      width: 307.875px;
      min-width: 307.875px;
      max-width: 307.875px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      display: inline-block;
      display: -ms-flexbox;
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      -webkit-flex-wrap: wrap;
      flex-wrap: wrap;
      -ms-flex-wrap: wrap;
      -ms-flex-pack: justify;
      -webkit-justify-content: space-around;
      justify-content: space-around;
      -webkit-transform: translate3d(0px, 0px, 0px);
      transform: translate3d(0px, 0px, 0px);
      opacity: 1;

      &.weekly-header{
        background-color: #f9f9f9;
      }

      .day-cell {
        background: none;
        border: 1px solid transparent;
        border-radius: 150px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: silver;
        cursor: pointer;
        font-weight: 400;
        width: 14.2857143%;
        -webkit-flex-basis: 14.2857143%;
        -ms-flex-preferred-size: 14.2857143%;
        flex-basis: 14.2857143%;
        max-width: 39px;
        height: 39px;
        line-height: 39px;
        margin: 0;
        display: inline-block;
        position: relative;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        text-align: center;
        padding: 0px;

        &.current-month {
          color: black;
        }

        &.today {
          border: 1px solid silver;
          border-radius: 20px;
          color: green;
        }

        &:hover {
          background-color: #dddddd;
          border: 1px solid white;
        }

        &.selected{
          background: #569ff7;
          -webkit-box-shadow: none;
          box-shadow: none;
          color: #fff;
          border-color: #569ff7;
        }
      }
    }


  }
</style>