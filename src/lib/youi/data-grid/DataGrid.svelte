<script lang='ts'>

	import { onMount } from 'svelte';

	import { mouse } from '../mouse/mouse';

	import Stage from '../konva/Stage.svelte';
	import Layer from '../konva/Layer.svelte';
	import Group from '../konva/Group.svelte';
	import Cell from './Cell.svelte';
	import classnames, { toPixel } from '../util/utils';
	import Konva from 'konva';
	import invariant from 'tiny-invariant';

	import {Direction} from './types';
	import type {ItemSizer, AreaProps, PosXYRequired, CellInterface, CellPosition, SelectionArea ,CellMetaDataMap} from './types'
	import {
		itemKey,
		getRowStartIndexForOffset,
		getColumnStartIndexForOffset,
		getColumnStopIndexForStartIndex,
		getRowOffset as getRowOffsetHelper,
		getRowHeight as getRowHeightHelper,
		getColumnOffset as getColumnOffsetHelper,
		getColumnWidth as getColumnWidthHelper,
		cellIdentifier,
		getEstimatedTotalHeight,
		getEstimatedTotalWidth,
		cellRangeToBounds,
		isEqualCells,
		getBoundedCells,
		getRowStopIndexForStartIndex, clampIndex
	} from './util';

	import FieldEditor from '../editor/FieldEditor.svelte';
	import Selection from './Selection.svelte';
	import { createEventDispatcher } from 'svelte';
	import { KeyCodes } from '../types/Event.d.ts';

	const dispatch = createEventDispatcher();

	const defaultRowHeight = () => 20;
	const defaultColumnWidth = () => 60;
	const DEFAULT_ESTIMATED_ITEM_SIZE = 60;

	const getRowOffset = (rowIndex) => getRowOffsetHelper(rowIndex, rowHeight, columnWidth, instanceProps, scale);
	const getRowHeight = (rowIndex) => getRowHeightHelper(rowIndex, instanceProps);
	const getColumnOffset = (colIndex) => getColumnOffsetHelper(colIndex, rowHeight, columnWidth, instanceProps, scale);
	const getColumnWidth = (colIndex) => getColumnWidthHelper(colIndex, instanceProps);

	let className = '';
	export { className as class };

	export let containerHeight = 600;
	export let containerWidth = 1000;
	export let data = {};//数据

	export let width: number;
	export let height: number;

	export let rowHeight: ItemSizer = defaultRowHeight;

	export let columnWidth: ItemSizer = defaultColumnWidth;
	/**
	 * Show scrollbars on the left and right of the grid
	 */
	export let showScrollbar = true;

	/**
	 * No of columns in the grid
	 */
	export let columnCount = 0;
	/**
	 * No of rows in the grid
	 */
	export let rowCount = 0;

	export let frozenRows = 0;

	/**
	 * Number of frozen columns
	 */
	export let frozenColumns = 0;

	export let isHiddenRow: (rowIndex: number) => boolean = (row) => false;
	export let isHiddenColumn:(columnIndex: number) => boolean = (col) => false;

	export let gridLineColor = '#E3E2E2';

	export let gridLineWidth = 1;

	export let scale = 1;

	/**
	 * Helps in lazy grid width calculation
	 */
	export let estimatedColumnWidth = 0;
	/**
	 * Helps in lazy grid height calculation
	 */
	export let estimatedRowHeight: number;
	/**
	 * Array of all selection bounds
	 */
	export let selections: SelectionArea[] = [];
	/**
	 * merged cells
	 */
	export let mergedCells: AreaProps[] = [];

	const instanceProps = {
		columnMetadataMap: {},
		rowMetadataMap: {},
		lastMeasuredColumnIndex: -1,
		lastMeasuredRowIndex: -1,
		estimatedColumnWidth: estimatedColumnWidth || DEFAULT_ESTIMATED_ITEM_SIZE,
		estimatedRowHeight: estimatedRowHeight || DEFAULT_ESTIMATED_ITEM_SIZE,
		recalcColumnIndices: [],
		recalcRowIndices: []
	};

	$: classes = classnames(className, 'youi-data-grid');

	// let cells = [];

	let scrollLeft = 0;
	let scrollTop = 0;

	const frozenRowHeight = 0;//getRowOffset(frozenRows);
	const frozenColumnWidth = getColumnOffset(frozenColumns);

	let container: HTMLDivElement;
	let stage: Konva.Stage;

	let rowStartIndex = 0;
	// let rowStopIndex = rowCount - 1;
	let columnStartIndex = 0;
	let columnStopIndex = columnCount - 1;

	const isMergedCell = ({
													rowIndex,
													columnIndex
												}: CellInterface) => mergedCellMap.has(cellIdentifier(rowIndex, columnIndex));

	const getCellBounds = ({ rowIndex, columnIndex }: CellInterface, spanMerges = true): AreaProps => {

		if (spanMerges && isMergedCell({ rowIndex, columnIndex })) {
			return mergedCellMap.get(
				cellIdentifier(rowIndex, columnIndex)
			) as AreaProps;
		}

		return {
			top: rowIndex,
			left: columnIndex,
			right: columnIndex,
			bottom: rowIndex
		} as AreaProps;
	};

	const isHiddenCell = (rowIndex: number, columnIndex: number) => false;

	const _buildMergedMap= (mergedCells)=>{
		const mergedCellMap = new Map();
		for (let i = 0; i < mergedCells.length; i++) {
			const bounds = mergedCells[i];
			for (const cell of getBoundedCells(bounds)) {
				mergedCellMap.set(cell, bounds);
			}
		}
		return mergedCellMap;
	}
	/**
	 * 列头信息
	 */
	let columnMetadataMap:CellMetaDataMap = [];
	/**
	 * 行头信息
	 */
	let rowMetadataMap:CellMetaDataMap = [];
	/**
	 *
	 */
	$: mergedCellMap = _buildMergedMap(mergedCells);

	$: rowStartIndex = getRowStartIndexForOffset({
		rowHeight,columnWidth,rowCount,columnCount,instanceProps,offset: scrollTop + frozenRowHeight,scale
	});

	$: rowStopIndex = getRowStopIndexForStartIndex({
		startIndex:rowStartIndex, rowCount, rowHeight, columnWidth, scrollTop:scrollTop, containerHeight, instanceProps, scale,
	});

	$: columnStartIndex = getColumnStartIndexForOffset({
		rowHeight, columnWidth, rowCount, columnCount, instanceProps: instanceProps, offset: scrollLeft + frozenColumnWidth, scale,
	});

	$: columnStopIndex = getColumnStopIndexForStartIndex({
		startIndex:columnStartIndex, columnCount, rowHeight, columnWidth, scrollLeft, containerWidth, instanceProps: instanceProps, scale,
	});

	$: showCells = _findShowCells(rowStartIndex,rowStopIndex,columnStartIndex,columnStopIndex,data);

	function _findShowCells(rowStartIndex,rowStopIndex,columnStartIndex,columnStopIndex,data){
		console.log(data)
		let cells = [];

		const mergedCellRenderMap = new Set();

		for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
			/* Skip frozen rows */
			if (rowIndex < frozenRows || isHiddenRow(rowIndex)) {
				continue;
			}
			for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {

				const isMerged = isMergedCell({ rowIndex, columnIndex });

				const bounds = getCellBounds({ rowIndex, columnIndex });
				const actualRowIndex = isMerged ? bounds.top : rowIndex;
				const actualColumnIndex = isMerged ? bounds.left : columnIndex;
				const actualBottom = Math.max(rowIndex, bounds.bottom);
				const actualRight = Math.max(columnIndex, bounds.right);

				if (!isMerged && isHiddenCell(actualRowIndex, actualColumnIndex)) {//&& isHiddenCell?.(actualRowIndex, actualColumnIndex)
					continue;
				}

				if (isMerged) {
					const cellId = cellIdentifier(bounds.top, bounds.left);
					if (mergedCellRenderMap.has(cellId)) {
						continue;
					}
					mergedCellRenderMap.add(cellId);
				}

				const y = getRowOffset(actualRowIndex);

				const height =
					getRowOffset(actualBottom) - y + getRowHeight(actualBottom);

				const x = getColumnOffset(actualColumnIndex);

				const width =
					getColumnOffset(actualRight) - x + getColumnWidth(actualRight);

				const cellData = getCellData({rowIndex:actualRowIndex,columnIndex:actualColumnIndex});

				//
				cells.push({
					x,
					y,
					width,
					height,
					text:cellData.value,
					rowIndex: actualRowIndex,
					columnIndex: actualColumnIndex,
					isMergedCell: isMerged,
					key: itemKey({
						rowIndex: actualRowIndex,
						columnIndex: actualColumnIndex
					})
				});
			}
		}
		return cells;
	}

	onMount(()=>{

	});

	function getCellData({rowIndex,columnIndex}){
		return data[[rowIndex,columnIndex]]||{value:''};
	}

	/**
	 * Convert selections to area
	 * Removed useMemo as changes to lastMeasureRowIndex, lastMeasuredColumnIndex,
	 * does not trigger useMemo
	 * Dependencies : [selections, rowStopIndex, columnStopIndex, instanceProps]
	 */
	//do selection
	$:selectionBoxes = _toSelectionBoxes(selections,scrollTop,scrollLeft);

	function _toSelectionBoxes(selections,scrollTop,scrollLeft) {
		let curSelectionAreas = [];

		for (let i = 0; i < selections.length; i++) {
			const selection = selections[i];
			const { bounds, inProgress, style } = selection;
			const { top, left, right, bottom } = bounds;
			const selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
			const actualBottom = bottom;//Math.min(1, );
			const actualRight = Math.min(columnStopIndex, right);
			const isLeftBoundFrozen = left < frozenColumns;
			const isTopBoundFrozen = top < frozenRows;
			const isIntersectionFrozen = top < frozenRows && left < frozenColumns;
			const isLast = i === selections.length - 1;

			selectionBounds.y = getRowOffset(top);
			selectionBounds.height =
				getRowOffset(actualBottom) -
				selectionBounds.y +
				getRowHeight(actualBottom);

			selectionBounds.x = getColumnOffset(left);

			selectionBounds.width =
				getColumnOffset(actualRight) -
				selectionBounds.x +
				getColumnWidth(actualRight);

			curSelectionAreas.push({
				x: selectionBounds.x-scrollLeft,
				y: selectionBounds.y-scrollTop,
				width: selectionBounds.width,
				height: selectionBounds.height
			});
		}

		dispatch('selection',{})
		return curSelectionAreas;
	}

	/**
	 * Get relative mouse position
	 */
	const getRelativePositionFromOffset = (left: number, top: number): PosXYRequired | null => {

		invariant(
			typeof left === 'number' && typeof top === 'number',
			'Top and left should be a number'
		);

		if (!stage) {
			return null;
		}

		const rect = container.getBoundingClientRect();
		left = left - rect.x;
		top = top - rect.y;

		const { x, y } = stage
			.getAbsoluteTransform()
			.copy()
			.invert()
			.point({ x: left, y: top });

		return { x, y };
	};

	/* Find frozen column boundary */
	const isWithinFrozenColumnBoundary = (x: number) => {
		return frozenColumns > 0 && x < frozenColumnWidth;
	};
	/* Find frozen row boundary */
	const isWithinFrozenRowBoundary = (y: number) => {
		return frozenRows > 0 && y < frozenRowHeight;
	};

	$: estimatedTotalHeight = getEstimatedTotalHeight(rowCount, instanceProps);
	$: estimatedTotalWidth = getEstimatedTotalWidth(columnCount, instanceProps);
	/**
	 * Get cell offset position from rowIndex, columnIndex
	 */
	const getCellOffsetFromCoords =
		(cell: CellInterface): CellPosition => {
			const {
				top: rowIndex,
				left: columnIndex,
				right,
				bottom
			} = getCellBounds(cell);
			const x = getColumnOffset(columnIndex);
			const y = getRowOffset(rowIndex);
			const width = getColumnOffset(right + 1) - x;
			const height = getRowOffset(bottom + 1) - y;

			return {
				x,
				y,
				width,
				height
			};
		};
	/**
	 * Get cell cordinates from current mouse x/y positions
	 */
	const getCellCoordsFromOffset = (left, top, includeFrozen) => {
		const pos = getRelativePositionFromOffset(left, top);
		if (!pos) return null;
		const { x, y } = pos;
		const rowOffset =
			includeFrozen && isWithinFrozenRowBoundary(y) ? y : y + scrollTop;
		const columnOffset =
			includeFrozen && isWithinFrozenColumnBoundary(x) ? x : x + scrollLeft;
		if (
			rowOffset > estimatedTotalHeight ||
			columnOffset > estimatedTotalWidth
		) {
			return null;
		}
		const rowIndex = getRowStartIndexForOffset({
			rowHeight,
			columnWidth,
			rowCount,
			columnCount,
			instanceProps: instanceProps,
			offset: rowOffset,
			scale
		});

		const columnIndex = getColumnStartIndexForOffset({
			rowHeight,
			columnWidth,
			rowCount,
			columnCount,
			instanceProps,
			offset:columnOffset,
			scale}
		);
		/* To be compatible with merged cells */
		const bounds = getCellBounds({ rowIndex, columnIndex });

		return { rowIndex: bounds.top, columnIndex: bounds.left };
	};

	const clearSelections = () => {
		selections = [];
	};

	let activeCell = null;
	let startCell = null;
	const mouseStart = (e) => {
		let coords = getCellCoordsFromOffset(e.clientX, e.clientY, false);
		if (!coords) return false;

		container.focus();

		startCell = coords;
		activeCell = startCell;
		//
		const isShiftKey = e.shiftKey;
		const isMetaKey = e.ctrlKey || e.metaKey;
		const allowMultiple = isMetaKey;

		/* Shift key */
		if (isShiftKey) {
			modifySelection(coords);
			return;
		}

		clearSelections();
	};

	const normalMouseUp = (e)=>{
		let coords = getCellCoordsFromOffset(e.clientX, e.clientY, false);
		if(!coords)return;

		container.focus();

		startCell = coords;
		activeCell = startCell;
		modifySelection(coords);
		closedFieldEditor();
	};

	const mouseDrag = (e) => {
		const coords = getCellCoordsFromOffset(e.clientX, e.clientY, false);
		if (coords && startCell && !isEqualCells(coords, startCell)) {
			modifySelection(coords);
		}
	};

	const mouseStop = (e) => {
		let coords = getCellCoordsFromOffset(e.clientX, e.clientY, false);
		if(isEqualCells(startCell,coords)){
			modifySelection(coords);
		}
		_selectionChanged();
		closedFieldEditor();
		startCell = null;
	};

	const _selectionChanged = ()=>{
		dispatch('selectionChange',{})
	}

	const selectionPolicy = 'multiple';

	/**
	 * selection object from start, end
	 * @param start
	 * @param end
	 */
	const selectionFromStartEnd = (start: CellInterface, end: CellInterface) => {
			return cellRangeToBounds(start, end, true, getCellBounds);
	};

	const appendSelection = (start: CellInterface,
													 end: CellInterface = start) => {
		//
		const bounds = selectionFromStartEnd(start, end);
		selections = [...selections, { bounds } as SelectionArea];
	};

	const  isCellOutOfBounds = (cell:CellInterface)=>(
		cell.rowIndex < selectionTopBound ||
		cell.columnIndex < selectionLeftBound
	)

	/* New selection */
	const newSelection = (start: CellInterface, end: CellInterface = start)=>{
		/* Validate bounds */
		if (isCellOutOfBounds(start)) {
			return;
		}
		activeCell = start;
		const bounds = selectionFromStartEnd(start, end);
		selections = [{ bounds, inProgress: false } as SelectionArea];
	}

	/* Modify current selection */
	const modifySelection = (coords: CellInterface, setInProgress?: boolean) => {
		if (selectionPolicy === 'single') {
			return;
		}
		const bounds = selectionFromStartEnd(startCell, coords);
		if (!bounds) return;

		const len = selections.length;
		if (!len) {
			selections = [{ bounds, inProgress: setInProgress ? true : false } as SelectionArea];
		}

		selections = selections.map((sel, i) => {
			if (len - 1 === i) {
				return {
					...sel,
					bounds,
					inProgress: setInProgress ? true : false
				} as SelectionArea;
			}
			return sel;
		});
	};

	let editing = false;
	let editingData = {value:''};
	let editingPos = {};
	let editingCell = null;

	const openFieldEditor = ()=>{
		if(!activeCell){
			return;
		}

		if(editing && editingCell){
			updateLastEditing();
		}

		editingCell = activeCell;
		editingPos = getCellOffsetFromCoords(activeCell);
		editingData = getCellData(activeCell);

		editing = true;
	}
	/**
	 *
	 */
	const closedFieldEditor = ()=>{
		if(editing && editingCell){
			updateLastEditing();
		}
		editing = false;
		editingData = {value:''};
		editingPos = {};
		editingCell = null;
	}

	const updateLastEditing = ()=>{
		//更新上一个编辑单元格
		showCells = showCells.map(cell=>isEqualCells(cell,editingCell)?Object.assign(cell,{text:editingData.value}):cell);
		//在data中写入新数据
		if(!data[[editingCell.rowIndex,editingCell.columnIndex]]){
			data[[editingCell.rowIndex,editingCell.columnIndex]] = Object.assign({},editingData);
		}
	}

	/* Handle vertical scroll */
	const handleScroll = (e)=>{
		scrollTop = e.target.scrollTop;
	}

	const handleKeydown = (e:KeyboardEvent)=>{
		const keyCode = e.which||e.keyCode;
		const isShiftKey = e.shiftKey;
		const isAltKey = e.altKey;
		const isMetaKey = e.ctrlKey || e.metaKey;

		switch (keyCode){
			case KeyCodes.Right:
				keyNavigate(Direction.Right, isShiftKey, isMetaKey);
				e.preventDefault();
				break;
			case KeyCodes.Up:
				keyNavigate(Direction.Up, isShiftKey, isMetaKey);
				e.preventDefault();
				break;
			case KeyCodes.Down:
				keyNavigate(Direction.Down, isShiftKey, isMetaKey);
				e.preventDefault();
				break;
			case KeyCodes.Left:
				keyNavigate(Direction.Left, isShiftKey, isMetaKey);
				e.preventDefault();
				break;
			case KeyCodes.Enter:
				if(activeCell){
					openFieldEditor();
				}
				break;
		}
	}

	let selectionTopBound = 0;
	let selectionLeftBound = 0;
	let selectionBottomBound = rowCount-1;
	let selectionRightBound = columnCount-1;
	/**
	 *
	 * @param direction
	 * @param isShiftKey
	 * @param isMetaKey
	 */
	const keyNavigate = (direction,isShiftKey,isMetaKey)=>{
		if(activeCell){
			let { rowIndex, columnIndex } = activeCell;

			const isMerged = isMergedCell(activeCell);

			const currentBounds = getCellBounds(activeCell);
			switch (direction) {
				case Direction.Right:
					if (isMergedCell) columnIndex = currentBounds.right;
					columnIndex = clampIndex(
						Math.min(columnIndex + 1, selectionRightBound),
						isHiddenColumn,
						direction
					);
					break;
				case Direction.Up:
					if (isMerged) rowIndex = currentBounds.top;
					rowIndex = clampIndex(
						Math.max(rowIndex - 1, selectionTopBound),
						isHiddenRow,
						direction
					);
					break;
				case Direction.Down:
					if (isMergedCell) rowIndex = currentBounds.bottom;
					rowIndex = clampIndex(
						Math.min(rowIndex + 1, selectionBottomBound),
						isHiddenRow,
						direction
					);
					break;
				case Direction.Left:
					if (isMergedCell) columnIndex = currentBounds.left;
					columnIndex = clampIndex(
						Math.max(columnIndex - 1, selectionLeftBound),
						isHiddenColumn,
						direction
					);
					break;
			}

			const newBounds = getCellBounds({
				rowIndex,
				columnIndex,
			});
			const coords = { rowIndex: newBounds.top, columnIndex: newBounds.left };

			newSelection(coords);
		}
	}

</script>
<div class='youi-data-grid' style='position: relative;'>
	<div class='data-grid-container' use:mouse={{normalMouseUp,mouseStart,mouseDrag,mouseStop}}
			 tabindex={0}
			 on:keydown={handleKeydown}
			 on:dblclick={openFieldEditor}
			 bind:this={container}>
		<Stage class={classes} {width} {height} bind:stage={stage}
					 {...$$restProps}>
			<Layer>
				<Group
					clipX={frozenColumnWidth}
					clipY={frozenRowHeight}
					clipWidth={containerWidth - frozenColumnWidth}
					clipHeight={containerHeight - frozenRowHeight}
				>
					<Group offsetY={scrollTop} offsetX={scrollLeft}>
						<!--{cells}-->
						{#each showCells as cell}
							<Cell  {...cell} >
								<slot name="cell" {cell}></slot>
							</Cell>
						{/each}
					</Group>
				</Group>

			</Layer>
		</Stage>
	</div>

	<!-- -->
	<div style='pointer-events:none'>
		{#if Array.isArray(selectionBoxes)}
			<Selection bind:selectionBoxes={selectionBoxes}></Selection>
		{/if}
	</div>

	{#if showScrollbar}
		<div
			className="data-grid-scrollbar data-grid-scrollbar-y"
			tabIndex={-1}
			style:position={'absolute'}
			style:height={toPixel(containerHeight)}
			style:top={0}
			style:right={0}
			style:width={13}
			style:overflow={'scroll'}
			style:will-change={'transform'}
			on:scroll={handleScroll}
		>
			<div style={'height:'+estimatedTotalHeight+'px;'}>&nbsp;</div>
		</div>
		<div
			className="data-grid-scrollbar data-grid-scrollbar-x"
			tabIndex={-1}
		>
			<div/>
		</div>
	{/if}

	<FieldEditor
		keydown={(e)=>console.log('kkk ddd')}
		isOpen={editing} x={editingPos.x} y={editingPos.y-scrollTop} width={editingPos.width+1}
		height={editingPos.height+1} bind:value={editingData.value}>

	</FieldEditor>

	{scrollTop}
</div>

<style>
	.data-grid-container{
		outline: none;
	}
</style>