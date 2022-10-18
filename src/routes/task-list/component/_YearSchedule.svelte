<!-- ***********************************************************************

    年度日程

*************************************************************************-->
<script lang="ts">

    import {NUMBERS_ZH} from "$lib/component/calendar/lunar.util";
    import {parseMonthData} from "../helper";
    import dayjs from "dayjs";

    export let width = 0;
    export let year: number = undefined;
    export let month: number = undefined;
    export let date: number = undefined;

    let monthDatas = [];

    $: if (year) {
        //
        let yearMonthDataList = [];
        for (let i = 0; i < 12; i++) {
            yearMonthDataList.push(parseMonthData(year, i));
        }
        monthDatas = yearMonthDataList;
    }

</script>

<div class="grid">
    {#each monthDatas as monthData,index}
        <div class="g-col-3">
            <div class="g-col-12 month-header">{NUMBERS_ZH[index]}月</div>
            <div class="container month-panel">
                <div class="row">
                    <div class="col">日</div>
                    <div class="col">一</div>
                    <div class="col">二</div>
                    <div class="col">三</div>
                    <div class="col">四</div>
                    <div class="col">五</div>
                    <div class="col">六</div>
                </div>
                {#each monthData.grid as rowData}
                    <div class="row">
                    {#each rowData as cell}
                        <div class="day-cell col"
                             class:today={cell.isToday}
                             class:current-month={cell.day.month() == index}>{cell.day.date()}</div>
                    {/each}
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .month-header{
        padding-left: 16px;
        font-size: 18px;
        font-weight: bold;
        color: indianred;
    }

    .month-panel{
        padding: 2px 12px;
    }

    .col{
        text-align: center;
        padding:3px;
    }

    .day-cell{
        color: silver;
        height: 24px;

      &.current-month{
        color: black;
      }
      &.today{
        color: red;
      }
    }
</style>

