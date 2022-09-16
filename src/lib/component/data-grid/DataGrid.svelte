
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
     *
     * @param _
     */
    export let rowHeight:ItemSizer = (_)=>DEFAULT_ROW_HEIGHT;
    /**
     *
     * @param _
     */
    export let colWidth:ItemSizer = (_)=>DEFAULT_COL_WIDTH;

    export let data = (_cellPos:CellPosition)=>{return {text:''} as CellData};

    /**
     * 选择选区
     */
    export let selections: Area[] = [];

    /**
     * 合并区域
     */
    export let mergedCells: Area[] = [];

    let contentWidth = 0;//宽度
    let contentHeight = 0;//高度

    let yScrollDom = undefined;
    let scrollTop = 0;
    let scrollLeft = 0;

    $: tableRowRange = calculateRange(Infinity,0,rows,rowHeight);
    $: tableColRange = calculateRange(Infinity,0,columns,colWidth);
    //
    $: tableWidth = calculateColumnWidths(Infinity,0,columns,colWidth).reduce((t,v)=>t+v);
    $: tableHeight = calculateRowHeights(Infinity,0,rows,rowHeight).reduce((t,v)=>t+v);

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

    $: frozenRowCells = buildFrozenRowCells(frozenRows,tableRowRange,colRange,mergedCellMap,data);
    $: frozenColumnCells = buildFrozenColumnCells(frozenColumns,rowRange,tableColRange,mergedCellMap,data);
    $: frozenIntersectionCells = buildIntersectionCells(frozenRows,frozenColumns,tableRowRange,tableColRange,mergedCellMap,data);

    $: selectionBoxes = selections.map(({startRow,endRow,startCol,endCol})=>{
        let x = tableColRange.sizes[startCol].offset;
        let y = tableRowRange.sizes[startRow].offset;
        let width = tableColRange.sizes[endCol].offset - x + tableColRange.sizes[endCol].size;
        let height =  tableRowRange.sizes[endRow].offset - y + tableRowRange.sizes[endRow].size;
        return {x,y,width,height};
    });

    let activePosition:CellPosition;
    let startPosition:CellPosition;
    let overPosition:CellPosition;

    /**
     *
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
    }
    /**
     * 拖动 - 选区
     * @param detail
     */
    const handle_mouse_start = ({detail}) => {
        let {offsetX,offsetY} = detail.evt;
        startPosition = findCellPosition(rowRange,colRange,offsetX,offsetY);
    }

    const handle_mouse_drag = ({detail})=>{
        let {offsetX,offsetY} = detail.evt;
        let dragging = findCellPosition(rowRange,colRange,offsetX,offsetY);
        if(!overPosition || !isEqualCells(dragging,overPosition)){
            if(!dragging){
                //自动左右滚动

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
            }
        }
    }

    const handle_mouse_stop = ({detail})=>{
        if(startPosition && overPosition){
            //
        }
        startPosition = null;
        overPosition = null;
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
        if(evt.deltaY){
            scrollTop = Math.max(Math.min(tableHeight - contentHeight+20,scrollTop+evt.deltaY),0);
            yScrollDom.scrollTop = scrollTop;
        }
    }

</script>
<Stage class="flex-full youi-data-grid" moused={true}
       on:mouseStart={handle_mouse_start}
       on:mouseDrag={handle_mouse_drag}
       on:mouseStop={handle_mouse_stop}
       on:normalMouseUp={handle_normal_mouseup}
       on:wheel={handle_wheel}
       bind:width={contentWidth} bind:height={contentHeight}
>
    {#if Array.isArray(selectionBoxes)}
        <Selection bind:x={scrollLeft} bind:y={scrollTop} {selectionBoxes}></Selection>
    {/if}

    <Layer>
        <Group offsetY={scrollTop} offsetX={scrollLeft}>
            {#each showCells as cell}
                <Cell {...cell}></Cell>
            {/each}
        </Group>

        <Group offsetX={scrollLeft} offsetY={0}>
            {#each frozenRowCells as cell}
                <Cell {...cell}></Cell>
            {/each}
        </Group>

        <Group offsetX={0} offsetY={scrollTop}>
            {#each frozenColumnCells as cell}
                <Cell {...cell}></Cell>
            {/each}
        </Group>

        <Group offsetX={0} offsetY={0}>
            {#each frozenIntersectionCells as cell}
                <Cell {...cell}></Cell>
            {/each}
        </Group>

    </Layer>

    {#if tableWidth>contentWidth}
        <div class="scrollbar scrollbar-x" tabIndex={-1} on:scroll={handle_x_scroll}>
            <div style:width={toPixel(tableWidth+20)}></div>
        </div>
    {/if}

    {#if tableHeight>contentHeight}
        <div class="scrollbar scrollbar-y" tabIndex={-1} on:scroll={handle_y_scroll} bind:this={yScrollDom}>
            <div style:height={toPixel(tableHeight+20)}></div>
        </div>
    {/if}
</Stage>