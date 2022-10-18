
<script lang="ts">
    import {Stage, Layer,Group} from "../../thirdpart/konva";
    import Cell from './Cell.svelte';
    import Selection from './Selection.svelte';
    import type {ItemSizer,CellPosition,CellData,Area} from "./DataGrid.d";
    import {
        calculateRowHeights, calculateColumnWidths,
        buildShowCells, buildFrozenRowCells, buildFrozenColumnCells,
        calculateRange, findCellPosition, isEqualCells, toMergeMap, expandedAreaByMerge, buildIntersectionCells
    } from "./helper";
    import {toPixel} from "../../youi";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();
    /**
     * 默认行高度
     */
    const DEFAULT_ROW_HEIGHT = 24;
    /**
     * 默认列宽度
     */
    const DEFAULT_COL_WIDTH = 80;

    /**
     * 列数
     */
    export let columns = 10;

    /**
     * 行数
     */
    export let rows = 20;

    /**
     * Number of frozen rows
     */
    export let frozenRows = 0;

    /**
     * Number of frozen columns
     */
    export let frozenColumns = 0;
    /**
     * 行高度计数函数
     * @param _
     */
    export let rowHeight:ItemSizer = (_)=>DEFAULT_ROW_HEIGHT;
    /**
     * 列宽度计算函数
     * @param _
     */
    export let colWidth:ItemSizer = (_)=>DEFAULT_COL_WIDTH;
    /**
     * 单元格数据获取函数
     * @param _cellPos
     */
    export let data = (_cellPos:CellPosition)=>{return {text:''} as CellData};

    export let showSelection = true;

    /**
     * 选择选区
     */
    export let selections: Area[] = [];

    /**
     * 合并区域
     */
    export let mergedCells: Area[] = [];

    export let dropping = false;//启动单元格接收

    export let scrollTop = 0;

    export let scrollLeft = 0;

    let contentWidth = 0;//宽度
    let contentHeight = 0;//高度
    //横向滚动条
    let yScrollDom = undefined;

    //行、列定位数据
    $: tableRowRange = calculateRange(Infinity,0,rows,rowHeight);
    $: tableColRange = calculateRange(Infinity,0,columns,colWidth);
    //
    $: tableWidth = calculateColumnWidths(Infinity,0,columns,colWidth).reduce((t,v)=>t+v);
    $: tableHeight = calculateRowHeights(Infinity,0,rows,rowHeight).reduce((t,v)=>t+v);
    //当前显示的行、列定位数据
    $: rowRange = calculateRange(contentHeight,scrollTop,rows,rowHeight);
    $: colRange = calculateRange(contentWidth,scrollLeft,columns,colWidth);
    /**
     * key =  cellIdentifier
     */
    $: mergedCellMap = toMergeMap(mergedCells);
    /**
     * 当前显示的单元格
     */
    $: showCells = buildShowCells(frozenRows,frozenColumns,rowRange,colRange,mergedCellMap,data);
    //冻结单元格
    $: frozenRowCells = buildFrozenRowCells(frozenRows,tableRowRange,colRange,mergedCellMap,data);
    $: frozenColumnCells = buildFrozenColumnCells(frozenColumns,rowRange,tableColRange,mergedCellMap,data);
    $: frozenIntersectionCells = buildIntersectionCells(frozenRows,frozenColumns,tableRowRange,tableColRange,mergedCellMap,data);
    //选区
    $: selectionBoxes = selections.map(({startRow,endRow,startCol,endCol})=>{
        let x = tableColRange.sizes[startCol].offset;
        let y = tableRowRange.sizes[startRow].offset;
        let width = tableColRange.sizes[endCol].offset - x + tableColRange.sizes[endCol].size;
        let height =  tableRowRange.sizes[endRow].offset - y + tableRowRange.sizes[endRow].size;
        return {x,y,width,height};
    });
    //单元格选择和区域拖动
    let activePosition:CellPosition;

    let startPosition:CellPosition;
    let overPosition:CellPosition;

    let containerOffsetX = 0;
    let containerOffsetY = 0;

    let dragElement:HTMLElement = undefined;
    let dragLeft = 0;
    let dragTop = 0;
    let dragCloneHtml = '';

    let dropPosition:CellPosition;

    /**
     * 鼠标拖动后的mouseup
     * @param e
     */
    const handle_normal_mouseup = ({detail}) => {
        let {offsetX,offsetY} = detail.evt;
        activePosition = findCellPosition(rowRange,colRange,offsetX,offsetY);
        if(activePosition){
            selections = [expandedAreaByMerge({
                startRow:activePosition.rowIndex,
                endRow:activePosition.rowIndex,
                startCol:activePosition.columnIndex,
                endCol:activePosition.columnIndex
            },mergedCellMap)];
        }
        dispatch('mouseup',{});
    }

    const isDragElement = (dom) => {
        return dom.classList.contains('cell-drag-item');
    }
    /**
     * 拖动 - 选区
     * @param detail
     */
    const handle_mouse_start = ({detail}) => {
        let {offsetX,offsetY,pageX,pageY} = detail.evt;
        //记录容器的offset量
        containerOffsetX = pageX - offsetX;
        containerOffsetY = pageY - offsetY;
        startPosition = findCellPosition(rowRange,colRange,offsetX,offsetY);

        if(isDragElement(detail.evt.target)){
            dragElement = detail.evt.target;
            dragCloneHtml = dragElement.outerHTML;
            containerOffsetX = dragElement.parentElement.parentElement.offsetLeft;
            containerOffsetY = dragElement.parentElement.parentElement.offsetTop;
        }

        dispatch('selection-start',{evt:detail.evt,startPosition});
    }
    /**
     * 鼠标拖动中
     * @param detail
     */
    const handle_mouse_drag = ({detail})=>{
        //cell-drag-item
        let {pageX,pageY} = detail.evt;
        let offsetX = pageX - containerOffsetX;
        let offsetY = pageY - containerOffsetY;
        
        if(dragElement){
            //元素拖动
            dragTop = pageY - containerOffsetY + 5;
            dragLeft = pageX - containerOffsetX + 5;
            dropping = true;//拖动后，单元格可drop
        }else{
            //单元格选择
            let dragging = findCellPosition(rowRange,colRange,offsetX,offsetY);
            if(!overPosition || !isEqualCells(dragging,overPosition)){
                if(!dragging){
                    //自动左右滚动
                    if(offsetX>contentHeight){
                        scrollLeft = Math.min(scrollLeft + 24,tableWidth - contentWidth);
                    }else if(offsetX<0){
                        scrollLeft = Math.max(scrollLeft - 24,0);
                    }
                    //自动上下滚动
                    if(offsetY>contentHeight){
                        scrollTop = Math.min(scrollTop + 24,tableHeight - contentHeight);
                    }else if(offsetY<0){
                        scrollTop = Math.max(scrollTop - 24,0);
                    }
                }else{
                    overPosition = dragging;
                    //更新选区
                    selections = [expandedAreaByMerge({
                        startRow:Math.min(startPosition.rowIndex,overPosition.rowIndex),
                        endRow:Math.max(startPosition.rowIndex,overPosition.rowIndex),
                        startCol:Math.min(startPosition.columnIndex,overPosition.columnIndex),
                        endCol:Math.max(startPosition.columnIndex,overPosition.columnIndex)
                    },mergedCellMap)];

                    dispatch('selection',{selections,startPosition,overPosition});
                }
            }
        }
    }
    /**
     * 结束拖动
     * @param detail
     */
    const handle_mouse_stop = ({detail})=>{
        if(startPosition && overPosition){
            dispatch('selection-stop',{selections,evt:detail.evt,stopPosition:{...overPosition}});
        }

        if(dragElement){
            //
            dropping = false;
            dropPosition = null;
            dispatch('drag-stop',{dragElement});
        }

        startPosition = null;
        overPosition = null;

        dragElement = null;
        dragCloneHtml = '';
    }

    /**
     *
     */
    const handle_mouse_move = ({detail}) => {
        if(dropping){
            const {offsetX,offsetY} = detail.evt;
            const movePosition = findCellPosition(rowRange,colRange,offsetX,offsetY);

            if(!isEqualCells(movePosition,dropPosition)){
                dropPosition = movePosition;
                dispatch('drop',{dropPosition,dragElement})
            }
        }
    }
    /**
     *
     * @param e
     */
    const handle_x_scroll = (e) => {
        scrollLeft = e.target.scrollLeft;
    }

    /**
     *
     * @param e
     */
    const handle_y_scroll = (e) => {
        scrollTop = e.target.scrollTop;
    }

    /**
     * 鼠标滚轮
     * @param detail
     */
    const handle_wheel = ({detail}) => {
        let {evt} = detail;
        if(yScrollDom && evt.deltaY){
            scrollTop = Math.max(Math.min(tableHeight - contentHeight+20,scrollTop+evt.deltaY),0);
            yScrollDom.scrollTop = scrollTop;
        }
    }

</script>
<Stage class="flex-full youi-data-grid" moused={true}
       on:mousedown
       on:mouseStart={handle_mouse_start}
       on:mouseDrag={handle_mouse_drag}
       on:mouseStop={handle_mouse_stop}
       on:normalMouseUp={handle_normal_mouseup}
       on:wheel={handle_wheel}
       on:mousemove={handle_mouse_move}
       bind:width={contentWidth} bind:height={contentHeight}
>
    <slot name="contextmenu" slot="contextmenu">

    </slot>
    {#if showSelection && Array.isArray(selectionBoxes)}
        <Selection bind:x={scrollLeft} bind:y={scrollTop} {selectionBoxes}></Selection>
    {/if}

    {#if dragElement}
        <div class="cell-drag-helper" style:left={toPixel(dragLeft)}
             style:top={toPixel(dragTop)}>
            {@html dragCloneHtml}
        </div>
    {/if}

    <Layer>
        <Group offsetY={scrollTop} offsetX={scrollLeft}>
            {#each showCells as cell}
                <Cell {...cell}>
                    <slot name="cell" {cell}></slot>
                </Cell>
            {/each}
        </Group>

        <slot name="layer">

        </slot>

        <Group offsetX={scrollLeft} offsetY={0}>
            {#each frozenRowCells as cell}
                <Cell {...cell}>

                </Cell>
            {/each}
        </Group>

        <Group offsetX={0} offsetY={scrollTop}>
            {#each frozenColumnCells as cell}
                <Cell {...cell}>

                </Cell>
            {/each}
        </Group>

        <Group offsetX={0} offsetY={0}>
            {#each frozenIntersectionCells as cell}
                <Cell {...cell}>

                </Cell>
            {/each}
        </Group>

    </Layer>

    {#if tableWidth>contentWidth}
        <div class="scrollbar scrollbar-x" tabIndex={-1} on:scroll={handle_x_scroll}>
            <div style:width={toPixel(tableWidth+20)} style:height="1px"></div>
        </div>
    {/if}

    {#if tableHeight>contentHeight}
        <div class="scrollbar scrollbar-y" tabIndex={-1} on:scroll={handle_y_scroll} bind:this={yScrollDom}>
            <div style:height={toPixel(tableHeight+20)}></div>
        </div>
    {/if}
    <slot>

    </slot>
</Stage>

<style>
    .cell-drag-helper{
        position: absolute;
        min-height: 10px;
        min-width: 60px;
        border: 1px solid silver;
        z-index: 2999;
    }
</style>