<script lang="ts">

    import dayjs from "dayjs";

    import {isNull, uuid, toPixel, ContextMenuOption} from "$lib/youi";
    import {toNDate} from "$lib/component/calendar/lunar.util";
    import DataGrid from "$lib/component/data-grid/DataGrid.svelte";
    import {Rect,Line} from "$lib/thirdpart/konva";
    import {addSchedule, removeSchedule} from "$lib/app-services/schedule/scheduleServices";

    import {CONTEXT_NAME, DEFAULT_COLOR, WEEKLY_TEXTS} from "../helper";

    import type {Schedule} from "$lib/app-entity/schedule/schedule";
    import type {CellPosition} from "$lib/component/data-grid/DataGrid";
    import {getContext} from "svelte";

    const HEADER_HEIGHT = 30;
    const ROW_HEIGHT = 15;
    const lines = buildLines();

    export let width = 0;
    export let year: number = undefined;
    export let month: number = undefined;
    export let date: number = undefined;

    export let scheduleList = [];//任务数据

    export let schedules = ({startTime,endTime}):Promise<[]>|undefined=>undefined;//日程数据
    const {openDialog,updateSchedule} = getContext(CONTEXT_NAME);
    let currentDay:dayjs.Dayjs;

    let days = [];
    let lmonth = '';//农历月份

    let selections = [];
    let scrollTop = 0;

    /** 拖动添加中的日程 */
    let addingSchedule:Schedule = undefined;

    let scheduleRects = [];
    let addingScheduleRects = [];

    let activeTaskId = '';

    $:data = ({rowIndex,columnIndex})=>{
        let text = '';
        let color = 'black';
        if(rowIndex === 0 ){
            if(columnIndex === 0){
                text = lmonth+'月';
            }else{
                const day = days[columnIndex-1];
                if(dayjs().isSame(day,'date')){
                    color ='red';
                }
                text = `${day.date()} ${WEEKLY_TEXTS[columnIndex-1]} ${toNDate(day.year(), day.month(), day.date()).ldate_zh}`;
            }
        }else if(columnIndex == 0 && rowIndex%4 === 1){
            let hour = Math.floor(rowIndex/4)
            text = `${hour<10?'0':''}${hour}:00`;
            color='silver';
        }
        return {
            text,
            color,
            align:'center',
            stroke:rowIndex === 0?'silver':'',
            fill:rowIndex === 0?'#f9f9f9':'',
            draw:text!=''
        }
    };

    $: if (year && !isNull(month) && date) {
        currentDay = dayjs().year(year).month(month).date(date).hour(0).minute(0).second(0).millisecond(0);
        const day = currentDay.day();
        const weeklyDays = [];
        for (let i = 0; i < 7; i++) {
            if (i < day) {
                weeklyDays.push(currentDay.subtract(day - i, 'day'));
            } else if (i == day) {
                weeklyDays.push(currentDay);
            } else if (i > day) {
                weeklyDays.push(currentDay.add(i - day, 'day'));
            }
        }
        days = weeklyDays;
        lmonth = toNDate(days[0].year(), days[0].month(), days[0].date()).lmonth_zh;
        initSchedules();
    }

    function initSchedules() {
        selections = [];
        const scheduleResult = schedules({startTime:days[0].valueOf(),endTime:days[6].valueOf()});

        if(scheduleResult){
            scheduleResult.then(data=>{
                console.log('loaded weekly schedules.')
                scheduleList = data.filter(s=>!s["all_day"]);
                if(scheduleList.length==0){
                    scheduleRects = [];
                }
            });
        }
    }

    const rowHeight = (rowIndex) => rowIndex===0?HEADER_HEIGHT:ROW_HEIGHT;

    $: colWidth = columnIndex=>columnIndex===0?60:(width-60)/7;
    $:verticalLines = buildVerticalLines(colWidth);

    $: if(scheduleList.length && colWidth){
        scheduleRects = scheduleListToRects(scheduleList);
    }

    $: if(addingSchedule){
        addingScheduleRects = scheduleListToRects([addingSchedule]);
    }

    const handle_grid_selection = ({detail}) => {
        //
        if(detail.selections && detail.selections.length>0) {
            const {startRow, endRow, startCol, endCol} = detail.selections[0];

            if(endRow>0 && endCol>0){
                if(!addingSchedule){
                    addingSchedule = {
                        id: uuid(),
                        text: "新建日程",
                        all_day: false, color: DEFAULT_COLOR, description: "",
                        end_time: 0, start_time: 0
                    };
                }
                const time:{start_time:number,end_time:number} = parsePeriodTime(startRow, endRow, startCol, endCol,detail.startPosition,detail.overPosition);
                addingSchedule = Object.assign(addingSchedule,{...time});
            }
        }
    }

    /**
     * 根据拖动区域确定任务开始时间
     */
    function parsePeriodTime(startRow, endRow, startCol, endCol,startPosition:CellPosition,overPosition:CellPosition):{start_time:number,end_time:number}{
        //
        let startTimeRowIndex;
        let entTimeRowIndex;

        if(startCol == endCol){
            startTimeRowIndex = startRow;
            entTimeRowIndex = endRow;
        }else if(startPosition.columnIndex < overPosition.columnIndex){
            //往右拖动
            startTimeRowIndex = startPosition.rowIndex;
            entTimeRowIndex = overPosition.rowIndex;
        }else if(startPosition.columnIndex > overPosition.columnIndex){
            //往左拖动
            startTimeRowIndex = overPosition.rowIndex;
            entTimeRowIndex = startPosition.rowIndex;
        }

        const startDay:dayjs.Dayjs = days[startCol-1];
        const endDay:dayjs.Dayjs = days[endCol-1];

        const startHour = Math.floor((startTimeRowIndex-1)/4);
        const startQuarter = (startTimeRowIndex-1)%4;
        const endHour = Math.floor((entTimeRowIndex-1)/4);
        const endQuarter = (entTimeRowIndex-1)%4;

        return {
            start_time: startDay.hour(startHour).minute(startQuarter*15).second(0).millisecond(0).valueOf(),
            end_time: endDay.hour(endHour).minute(endQuarter*15).second(0).millisecond(0).valueOf()
        }
    }

    /**
     * 任务转矩形块
     */
    function scheduleListToRects(scheduleList) {
        //
        const rects = [];

        scheduleList.forEach(schedule=>{
            //
            const startTime:dayjs.Dayjs = dayjs(schedule.start_time);
            const endTime:dayjs.Dayjs = dayjs(schedule.end_time);

            const startRowIndex = startTime.hour()*4 + Math.ceil(startTime.minute()/15);
            const startColumnIndex = findColumnIndex(startTime);

            const endRowIndex = endTime.hour()*4 + Math.ceil(endTime.minute()/15);
            const endColumnIndex = findColumnIndex(endTime);

            if(startColumnIndex == endColumnIndex){
                //同一列
                rects.push({
                    startTime,
                    schedule,
                    y:startRowIndex*ROW_HEIGHT+HEADER_HEIGHT,
                    x:60 + colWidth(startColumnIndex)*(startColumnIndex-1),
                    width:colWidth(startColumnIndex),
                    height:(endRowIndex - startRowIndex+1)*ROW_HEIGHT
                });
            }
        });

        return rects;//
    }

    function findColumnIndex(day:dayjs.Dayjs) {
        return days.map((theDay,index)=>day.isSame(theDay,'day')?(index+1):0).reduce((t,v)=>t+v);
    }

    const handle_grid_selection_stop = async ({detail}) => {
        //
        if(addingSchedule){
            //存储拖动生成的日程
            await addSchedule(addingSchedule);
            scheduleList.push({...addingSchedule});
            scheduleList = scheduleList;
            addingScheduleRects = [];
        }
        addingSchedule = undefined;
    }

    const handle_grid_mousedown = (ui) => {
        activeTaskId = '';
    }
    /**
     * lines
     */
    function buildLines() {
        const lines = [];
        for(let i=0;i<24;i++){
            lines.push({
                y:i*ROW_HEIGHT*4+HEADER_HEIGHT
            });
        }
        return lines;
    }

    /**
     * 垂直线条
     * @param colWidth
     */
    function buildVerticalLines(colWidth) {
        const verticalLines = [];
        for(let i=0;i<7;i++){
            verticalLines.push({
                x:colWidth(i+1)*i+60
            });
        }
        return verticalLines;
    }

    const doRemoveSchedule = async () => {
        if(activeTaskId){
            await removeSchedule(activeTaskId);
            scheduleList = scheduleList.filter(schedule=>schedule.id != activeTaskId);
        }
    }

    const editSchedule = (e,schedule) => {
        openDialog('edit-task',e.clientX,e.clientY-20,schedule);
    }
</script>

<DataGrid columns={8} rows={97} bind:scrollTop
          {selections} showSelection={false}
          on:mousedown={handle_grid_mousedown}
          on:selection={handle_grid_selection}
          on:selection-stop={handle_grid_selection_stop}
          {rowHeight} {colWidth} frozenRows={1} {data}>
    <svelte:fragment slot="contextmenu">
        {#if activeTaskId}
            <ContextMenuOption labelText="详情"/>
            <ContextMenuOption labelText="删除" on:click={()=>doRemoveSchedule()}/>
        {:else}
            <ContextMenuOption labelText="新建日程"/>
        {/if}
    </svelte:fragment>
    <!-- 自定义的图层内容 -->
    <svelte:fragment slot="layer">
        {#each lines as line}
            <Line points={[0,line.y-scrollTop,2400,line.y-scrollTop]} stroke={"#dddddd"}></Line>
        {/each}

        {#each verticalLines as line,index}
            <Line points={[line.x,0,line.x,2000]} stroke={"#dddddd"}></Line>
        {/each}

        {#each addingScheduleRects as scheduleRect}
            <Rect fill={scheduleRect.schedule.color} x={scheduleRect.x} y={scheduleRect.y-scrollTop} cornerRadius={5}
                  opacity={0.8}
                  width={scheduleRect.width} height={scheduleRect.height} stroke={'white'}>
            </Rect>
        {/each}
    </svelte:fragment>

    <div class="schedule-container">
    {#each scheduleRects as scheduleRect}
        <div class="schedule-rect cell-drag-item"
             class:one-quarter={scheduleRect.height<20}
             class:active={activeTaskId == scheduleRect.schedule.id}
             on:mousedown={()=>{activeTaskId = scheduleRect.schedule.id}}
             on:dblclick={(e)=>editSchedule(e,scheduleRect.schedule)}
             style:left={toPixel(scheduleRect.x)}
             style:top={toPixel(scheduleRect.y-scrollTop-1)}
             style:width={toPixel(scheduleRect.width-2)}
             style:height={toPixel(scheduleRect.height-2)}
             style:background-color={scheduleRect.schedule.color}
        >
            {#if scheduleRect.height>20}
                <div>{scheduleRect.startTime.format('HH:mm')}</div>
            {/if}
            <div>{scheduleRect.schedule.text}</div>
        </div>
    {/each}
    </div>
</DataGrid>

<style lang="scss">
  .schedule-container{
    -moz-user-select:none;
    -webkit-user-select:none;
    -ms-user-select:none;
    -khtml-user-select:none;
    user-select:none;

    .schedule-rect {
      position: absolute;
      border-radius: 5px;
      opacity: 0.8;
      margin: 1px;
      overflow: hidden;
      font-size: 0.9rem;
      padding:2px 6px;
      &:hover{
        opacity: 0.9;
      }
      &.active{
        opacity: 1;
      }
      &.one-quarter{
        padding:0px 6px;
        font-size: 0.7rem;
      }
    }
  }

</style>



