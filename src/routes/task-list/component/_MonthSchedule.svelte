<!-- ***********************************************************************

    月度日程

*************************************************************************-->
<script lang="ts">
    import {createEventDispatcher, getContext} from "svelte";
    import {ContextMenuOption, isNull, uuid} from "$lib/youi";
    import {Group,Text} from "$lib/thirdpart/konva";
    import DataGrid from "$lib/component/data-grid/DataGrid.svelte";

    import {addSchedule, removeSchedule} from "$lib/app-services/schedule/scheduleServices";

    import {
        buildScheduleCells,
        CONTEXT_NAME,
        DEFAULT_COLOR,
        oppositeColor,
        parseMonthData,
        WEEKLY_TEXTS
    } from "../helper";
    import type { MonthData} from "../helper";

    const dispatch = createEventDispatcher();

    const columns = 7;

    export let width = 0;
    export let year:number = undefined;
    export let month:number = undefined;
    export let date:number = undefined;
    export let scheduleList = [];//任务数据

    export let schedules = ({startTime,endTime}):Promise<[]>|undefined=>undefined;//日程数据

    const {openDialog,updateSchedule} = getContext(CONTEXT_NAME);

    let selections = [];
    let monthData:MonthData;

    let activeTaskId = '';
    let addingTask = undefined;//新增的task
    let movingTask = undefined;//移动中的task
    let scrollTop = 0;

    $: data = buildData(monthData,scheduleList);

    $: tableData = ({rowIndex,columnIndex})=>{
        if(rowIndex === 0){
            return {
                text:WEEKLY_TEXTS[columnIndex],
                align:'right',
                fill:'#f9f9f9',
                verticalAlign:'middle',
                fontSize:18,
                padding:2,
                color:'black'
            }
        }else if(data[rowIndex-1] && data[rowIndex-1][columnIndex]){
            let scheduleCell = data[rowIndex-1][columnIndex];
            let color = (scheduleCell.day.year() == monthData.year && scheduleCell.day.month() == monthData.month)?'#000000':'#dddddd';
            if(scheduleCell.isToday){
                color = 'red'
            }
            let date_zh = scheduleCell.ndata.ldate ===1? `${scheduleCell.ndata.lmonth_zh}月${scheduleCell.ndata.ldate_zh}`:scheduleCell.ndata.ldate_zh;

            return {
                text: scheduleCell.day.date()===1?(`${scheduleCell.day.month()+1}月${scheduleCell.day.date()}`):scheduleCell.day.date() +'日',
                align:'right',
                fontSize:16,
                verticalAlign:'top',
                color,
                padding:5,
                fill:(columnIndex === 0 || columnIndex === 6)?'#f9f9f9':'white',
                data:{date_zh,...scheduleCell.ndata,tasks:scheduleCell.tasks}
            };
        }
        return {text:''}
    }

    /**
     * 构建数据
     * @param monthData
     * @param scheduleList
     */
    function buildData(monthData,scheduleList) {
        if(monthData){
            return buildScheduleCells(monthData,scheduleList);
        }
        return [];
    }

    const rowHeight = rowIndex=>rowIndex===0?32:96;

    $: colWidth= _columnIndex=>width/columns;
    $: if(year && !isNull(month) && date){
        monthData = parseMonthData(year,month);
        initSchedules();
    }

    /**
     * 加载日程数据
     */
    function initSchedules() {
        selections = [];
        const scheduleResult = schedules({
            startTime:monthData.grid[0][0].day.valueOf(),
            endTime:monthData.grid[monthData.rows-1][6].day.valueOf()
        });

        if(scheduleResult){
            scheduleResult.then(data=>{
                console.log('loaded schedules.')
                scheduleList = data;
            });
        }
    }

    const handle_grid_mousedown = (ui) => {
        activeTaskId = '';
    }
    /**
     * 拖动创建日程
     * @param detail
     */
    const handle_grid_selection = ({detail}) => {
        //
        if(detail.selections && detail.selections.length>0){
            const {startRow,endRow,startCol,endCol} = detail.selections[0];
            //
            if(startRow>0 && endRow<=monthData.rows && startCol>=0 && endCol<7){
                //从单元格获取开始和结束日期
                let startDate = monthData.grid[startRow-1][startCol];
                let endDate = monthData.grid[endRow-1][endCol];

                //不同行处理
                if(detail.startPosition.rowIndex > startRow){
                    //向上拖动
                    startDate  = monthData.grid[detail.overPosition.rowIndex-1][detail.overPosition.columnIndex];
                    endDate = monthData.grid[detail.startPosition.rowIndex-1][detail.startPosition.columnIndex];
                }else if(detail.overPosition.rowIndex > startRow){
                    //向下拖动
                    startDate = monthData.grid[detail.startPosition.rowIndex-1][detail.startPosition.columnIndex];
                    endDate  = monthData.grid[detail.overPosition.rowIndex-1][detail.overPosition.columnIndex];
                }

                if(!addingTask){
                    addingTask = {id:uuid(),color:DEFAULT_COLOR,all_day:true};
                    scheduleList.push(addingTask);
                }

                addingTask.start_time = startDate.day.valueOf();
                addingTask.end_time = endDate.day.valueOf();
                addingTask.text = '新建日程';

                scheduleList = scheduleList;
            }
        }
    }

    /**
     *
     */
    const handle_grid_selection_stop = async () => {
        //存储拖动生成的日程
        await addSchedule(addingTask);
        addingTask = undefined;
    }


    const taskMoving = (ui) => {
        const {dropPosition,dragElement} = ui.detail;
        const taskId = dragElement.getAttribute('data-id');
        if(monthData && taskId){
            const task = scheduleList.filter(task=>task.id == taskId)[0];
            if(task){
                const movingId = task.id+'_moving';
                if(!movingTask || movingTask.id != movingId){
                    movingTask = {...task,id:movingId};
                    scheduleList.push(movingTask);
                    activeTaskId = movingId;
                }

                //重新设置startTime 和 endTime movingTask
                let monthDay = monthData.grid[dropPosition.rowIndex-1][dropPosition.columnIndex];

                const start_time = monthDay.day.valueOf();
                const end_time = start_time + task.end_time - task.start_time;

                Object.assign(movingTask,{start_time,end_time});

                scheduleList = scheduleList;
            }
        }
    }

    /**
     *
     */
    const dropTask = ({detail}) => {
        const {dragElement} = detail;
        const taskId = dragElement.getAttribute('data-id');
        if(taskId && movingTask){
            const task = scheduleList.filter(task=>task.id == taskId)[0];
            scheduleList.pop();

            if(task){
                Object.assign(task,{start_time:movingTask.start_time,end_time:movingTask.end_time});
                updateSchedule(task);
            }

            movingTask = undefined;
            scheduleList = scheduleList;
            activeTaskId = taskId;
        }
    }

    const selectTask = (e,task) => {
        //
        activeTaskId = task.id;
    }

    const editTask = (e,task) => {
        openDialog('edit-task',e.clientX,e.clientY-20,task);
    }

    /**
     *
     */
    const doRemoveSchedule = async () => {
        if(activeTaskId){
            await removeSchedule(activeTaskId);
            scheduleList = scheduleList.filter(schedule=>schedule.id != activeTaskId);
        }
    }
</script>

<DataGrid {selections} bind:scrollTop data={tableData} rows={monthData.rows+1} columns={columns} {colWidth} {rowHeight}
          showSelection={false}
          on:mousedown={handle_grid_mousedown}
          on:selection={handle_grid_selection}
          on:selection-stop={handle_grid_selection_stop}
          on:drag-stop={(ui)=>dropTask(ui)}
          on:drop={(ui)=>taskMoving(ui)}
    >
    <svelte:fragment slot="contextmenu">
        {#if activeTaskId}
            <ContextMenuOption labelText="详情"/>
            <ContextMenuOption labelText="删除" on:click={()=>doRemoveSchedule()}/>
        {:else}
            <ContextMenuOption labelText="新建日程"/>
        {/if}
    </svelte:fragment>
    <Group slot="cell" let:cell >
        {#if cell.data}
            <!-- 显示农历数据 -->
            <Text text={cell.data.date_zh}
                  padding={5}
                  fontSize={14}
                  fontStyle={(cell.data && cell.data.ldate === 1) ? 'bold' : ''}
                  x={0} height={10} width={100} fill={cell.color}
                  y={0}/>
            {#if cell.data.tasks && cell.data.tasks.length}
                <div class="task-day-group"
                     style:left={cell.x+'px'}
                     style:top={(cell.y + 24)+'px'}
                     style:width={cell.width+'px'}>
                    {#each cell.data.tasks as task,index}
                        <div class="task-day cell-drag-item"
                             class:start={task.isStart} class:end={task.isEnd} class:active={activeTaskId == task.id}
                             style:top={(task.index*17-scrollTop)+'px'}
                             style:left={(task.isStart?8:0)+'px'}
                             style:width={((task.isStart && task.isEnd)?(cell.width-16):(task.isStart||task.isEnd?(cell.width-8):cell.width))+'px'}
                             style:background={task.color||DEFAULT_COLOR}
                             style:color={oppositeColor(task.color||DEFAULT_COLOR,0)}
                             data-id={task.id}
                             on:mousedown={(e)=>selectTask(e,task)}
                             on:dblclick={(e)=>editTask(e,task)}
                        >
                            {#if task.isStart}
                                {task.text}
                            {:else}
                                <span class="task-text-hide">{task.text}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </Group>
</DataGrid>


<style lang="scss">
  .task-day-group{
    position: absolute;
    .task-day{
      position: absolute;
      height: 16px;
      font-size: 11px;
      background-color: #dddddd;
      padding-left: 5px;
      width:100%;
      opacity: 0.8;

      &.start{
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
      }

      &.end{
        border-bottom-right-radius: 5px;
        border-top-right-radius: 5px;
      }

      &.active{
        opacity: 1;
        color: white;
      }

      .task-text-hide{
        display: none;
      }
    }
  }
</style>