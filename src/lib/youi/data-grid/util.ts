import type { IItemMetaData ,InstanceInterface,CellMetaData,CellInterface,AreaProps,IRowStopIndex,IColumnStopIndex} from './types';
import { isNull } from '../util/utils';
import {Direction} from "./types";

export enum Align {
	start = "start",
	end = "end",
	center = "center",
	auto = "auto",
	smart = "smart",
}

export enum ItemType {
	row = "row",
	column = "column",
}

export const itemKey = ({ rowIndex, columnIndex }: CellInterface) =>
	`${rowIndex}:${columnIndex}`;

export const getRowStartIndexForOffset = ({
																						rowHeight,
																						columnWidth,
																						rowCount,
																						columnCount,
																						instanceProps,
																						offset,
																						scale,
																					}: Omit<IItemMetaData, "index" | "itemType">): number => {
	return findNearestItem({
		itemType: ItemType.row,
		rowHeight,
		columnWidth,
		rowCount,
		columnCount,
		instanceProps,
		offset,
		scale,
	});
};


export const getRowOffset = (index,
															 rowHeight,
															 columnWidth,
															 instanceProps,
															 scale): number => {
	return getItemMetadata({
		itemType: ItemType.row,
		index,
		rowHeight,
		columnWidth,
		instanceProps,
		scale,
	}).offset;
};

export const getColumnWidth = (
	index: number,
	instanceProps: InstanceInterface
) => {
	return instanceProps.columnMetadataMap[index].size;
};

export const getColumnOffset = (index,
																	rowHeight,
																	columnWidth,
																	instanceProps,
																	scale): number => {
	return getItemMetadata({
		itemType: ItemType.column,
		index,
		rowHeight,
		columnWidth,
		instanceProps,
		scale,
	}).offset;
};

export const getColumnStartIndexForOffset = ({rowHeight,
																							 columnWidth,
																							 rowCount,
																							 columnCount,
																							 instanceProps,
																							 offset,
																							 scale}): number => {
	return findNearestItem({
		itemType: ItemType.column,
		rowHeight,
		columnWidth,
		rowCount,
		columnCount,
		instanceProps,
		offset,
		scale,
	});
};

export const getColumnStopIndexForStartIndex = ({
																									startIndex,
																									rowHeight,
																									columnWidth,
																									instanceProps,
																									containerWidth,
																									scrollLeft,
																									columnCount,
																									scale,
																								}: IColumnStopIndex): number => {
	const itemMetadata = getItemMetadata({
		itemType: ItemType.column,
		index: startIndex,
		rowHeight,
		columnWidth,
		instanceProps,
		scale,
	});
	const maxOffset = scrollLeft + containerWidth;

	let offset = itemMetadata.offset + itemMetadata.size;
	let stopIndex = startIndex;

	while (stopIndex < columnCount - 1 && offset < maxOffset) {
		stopIndex++;
		offset += getItemMetadata({
			itemType: ItemType.column,
			rowHeight,
			columnWidth,
			index: stopIndex,
			instanceProps,
			scale,
		}).size;
	}

	return stopIndex;
};

export const getRowHeight = (
	index: number,
	instanceProps: InstanceInterface
) => {
	return instanceProps.rowMetadataMap[index].size;
};



type IGetItemMetadata = Pick<
		IItemMetaData,
		| "itemType"
		| "index"
		| "rowHeight"
		| "columnWidth"
		| "instanceProps"
		| "scale"
		>

export const getItemMetadata = ({
																	itemType,
																	index,
																	rowHeight,
																	columnWidth,
																	instanceProps,
																	scale = 2,
																}: IGetItemMetadata): CellMetaData => {
	let itemMetadataMap, itemSize, lastMeasuredIndex, recalcIndices: number[];
	if (itemType === "column") {
		itemMetadataMap = instanceProps.columnMetadataMap;
		itemSize = columnWidth;
		lastMeasuredIndex = instanceProps.lastMeasuredColumnIndex;
		recalcIndices = instanceProps.recalcColumnIndices;
	} else {
		itemMetadataMap = instanceProps.rowMetadataMap;
		itemSize = rowHeight;
		lastMeasuredIndex = instanceProps.lastMeasuredRowIndex;
		recalcIndices = instanceProps.recalcRowIndices;
	}
	const recalcWithinBoundsOnly = recalcIndices.length > 0;
	if (index > lastMeasuredIndex) {
		let offset = 0;
		if (lastMeasuredIndex >= 0) {
			const itemMetadata = itemMetadataMap[lastMeasuredIndex];
			offset = itemMetadata.offset + itemMetadata.size;
		}

		for (let i = lastMeasuredIndex + 1; i <= index; i++) {
			// Only recalculates specified columns
			const size = recalcWithinBoundsOnly
				? recalcIndices.includes(i)
					? itemSize(i) * scale
					: itemMetadataMap[i]?.size || itemSize(i) * scale
				: itemSize(i) * scale;

			itemMetadataMap[i] = {
				offset,
				size,
			};

			offset += size;
		}

		if (itemType === "column") {
			instanceProps.lastMeasuredColumnIndex = index;
		} else {
			instanceProps.lastMeasuredRowIndex = index;
		}
	}

	return itemMetadataMap[index];
};

const findNearestItem = ({
													 itemType,
													 rowHeight,
													 columnWidth,
													 rowCount,
													 columnCount,
													 instanceProps,
													 offset,
													 scale,
												 }: Omit<IItemMetaData, "index">): number => {
	let itemMetadataMap, lastMeasuredIndex;
	if (itemType === "column") {
		itemMetadataMap = instanceProps.columnMetadataMap;
		lastMeasuredIndex = instanceProps.lastMeasuredColumnIndex;
	} else {
		itemMetadataMap = instanceProps.rowMetadataMap;
		lastMeasuredIndex = instanceProps.lastMeasuredRowIndex;
	}

	const lastMeasuredItemOffset =
		lastMeasuredIndex > 0 ? itemMetadataMap[lastMeasuredIndex].offset : 0;
	if (lastMeasuredItemOffset >= offset) {
		// If we've already measured items within this range just use a binary search as it's faster.
		return findNearestItemBinarySearch({
			itemType,
			rowHeight,
			columnWidth,
			instanceProps,
			high: lastMeasuredIndex,
			low: 0,
			offset,
			scale,
		});
	} else {
		// If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
		// The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
		// The overall complexity for this approach is O(log n).
		return findNearestItemExponentialSearch({
			itemType,
			rowHeight,
			rowCount,
			columnCount,
			columnWidth,
			instanceProps,
			index: Math.max(0, lastMeasuredIndex),
			offset,
			scale,
		});
	}
};


interface IBinarySearchArgs
	extends Omit<IItemMetaData, "index" | "rowCount" | "columnCount"> {
	high: number;
	low: number;
}
const findNearestItemBinarySearch = ({
																			 itemType,
																			 rowHeight,
																			 columnWidth,
																			 instanceProps,
																			 high,
																			 low,
																			 offset,
																			 scale,
																		 }: IBinarySearchArgs): number => {
	while (low <= high) {
		const middle = low + Math.floor((high - low) / 2);
		const currentOffset = getItemMetadata({
			itemType,
			rowHeight,
			columnWidth,
			index: middle,
			instanceProps,
			scale,
		}).offset;

		if (currentOffset === offset) {
			return middle;
		} else if (currentOffset < offset) {
			low = middle + 1;
		} else if (currentOffset > offset) {
			high = middle - 1;
		}
	}

	if (low > 0) {
		return low - 1;
	} else {
		return 0;
	}
};


const findNearestItemExponentialSearch = ({
																						itemType,
																						rowHeight,
																						columnWidth,
																						rowCount,
																						columnCount,
																						instanceProps,
																						index,
																						offset,
																						scale,
																					}: IItemMetaData) => {
	const itemCount = itemType === "column" ? columnCount : rowCount;
	let interval = 1;

	while (
		index < itemCount &&
		getItemMetadata({
			itemType,
			rowHeight,
			columnWidth,
			index,
			instanceProps,
			scale,
		}).offset < offset
		) {
		index += interval;
		interval *= 2;
	}

	return findNearestItemBinarySearch({
		itemType,
		rowHeight,
		columnWidth,
		instanceProps,
		high: Math.min(index, itemCount - 1),
		low: Math.floor(index / 2),
		offset,
		scale,
	});
};



/**
 * Convert 2 cells to bounds
 * @param start
 * @param end
 * @returns
 *
 * 2 loops O(n)
 */
export const cellRangeToBounds = (
	start: CellInterface,
	end: CellInterface,
	spanMerges = true,
	getCellBounds: (cell: CellInterface) => AreaProps
):AreaProps => {
	let top = Math.min(start.rowIndex, end.rowIndex);
	let bottom = Math.max(start.rowIndex, end.rowIndex);
	let left = Math.min(start.columnIndex, end.columnIndex);
	let right = Math.max(start.columnIndex, end.columnIndex);
	/**
	 * The idea is that
	 * We do 2 loops >
	 * Left to Right and then top to bottom
	 *  => Find top cell and bottom cell and check
	 * if there are any merged cells at the edge
	 * Then keep extending our top and bottom bounds accordingly
	 *
	 * Same goes for Top to bottom
	 *  => Find left most and right most cells
	 */

	if (spanMerges) {
		for (let columnIndex = left; columnIndex <= right; columnIndex++) {
			const topCell = getCellBounds({ rowIndex: top, columnIndex });
			const bottomCell = getCellBounds({ rowIndex: bottom, columnIndex });
			bottom = Math.max(topCell.bottom, bottomCell.bottom, bottom);
			top = Math.min(topCell.top, bottomCell.top, top);
		}
		for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
			const topCell = getCellBounds({ rowIndex, columnIndex: left });
			const bottomCell = getCellBounds({ rowIndex, columnIndex: right });
			right = Math.max(topCell.right, bottomCell.right, right);
			left = Math.min(topCell.left, bottomCell.left, left);
		}
	}

	return {
		top,
		left,
		right,
		bottom,
	};
};

export const isEqualCells = (
	a: CellInterface | null,
	b: CellInterface | null
) => {
	if (isNull(a) || isNull(b) || a === null || b === null) return false;
	return a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex;
};

export const getBoundedCells = (area: AreaProps | null | undefined) => {
	const cells = new Set();
	if (!area) return cells;
	const { top, bottom, left, right } = area;
	for (let i = top; i <= bottom; i++) {
		for (let j = left; j <= right; j++) {
			cells.add(cellIdentifier(i, j));
		}
	}
	return cells;
};

export const getEstimatedTotalHeight = (
	rowCount: number,
	instanceProps: InstanceInterface
) => {
	const { estimatedRowHeight } = instanceProps;
	let totalSizeOfMeasuredRows = 0;
	let { lastMeasuredRowIndex, rowMetadataMap } = instanceProps;

	// Edge case check for when the number of items decreases while a scroll is in progress.
	// https://github.com/bvaughn/react-window/pull/138
	if (lastMeasuredRowIndex >= rowCount) {
		lastMeasuredRowIndex = rowCount - 1;
	}

	if (lastMeasuredRowIndex >= 0) {
		const itemMetadata = rowMetadataMap[lastMeasuredRowIndex];
		totalSizeOfMeasuredRows = itemMetadata.offset + itemMetadata.size;
	}

	const numUnmeasuredItems = rowCount - lastMeasuredRowIndex - 1;
	const totalSizeOfUnmeasuredItems = numUnmeasuredItems * estimatedRowHeight;

	return totalSizeOfMeasuredRows + totalSizeOfUnmeasuredItems;
};

export const getEstimatedTotalWidth = (
	columnCount: number,
	instanceProps: InstanceInterface
) => {
	const { estimatedColumnWidth } = instanceProps;
	let totalSizeOfMeasuredRows = 0;
	let { lastMeasuredColumnIndex, columnMetadataMap } = instanceProps;
	// Edge case check for when the number of items decreases while a scroll is in progress.
	// https://github.com/bvaughn/react-window/pull/138
	if (lastMeasuredColumnIndex >= columnCount) {
		lastMeasuredColumnIndex = columnCount - 1;
	}

	if (lastMeasuredColumnIndex >= 0) {
		const itemMetadata = columnMetadataMap[lastMeasuredColumnIndex];
		totalSizeOfMeasuredRows = itemMetadata.offset + itemMetadata.size;
	}

	const numUnmeasuredItems = columnCount - lastMeasuredColumnIndex - 1;
	const totalSizeOfUnmeasuredItems = numUnmeasuredItems * estimatedColumnWidth;

	return totalSizeOfMeasuredRows + totalSizeOfUnmeasuredItems;
};

/* Create a stringified cell identifier */
export const cellIdentifier = (rowIndex: number, columnIndex: number): string =>
	`${rowIndex},${columnIndex}`;



export const getRowStopIndexForStartIndex = ({
																							 startIndex,
																							 rowCount,
																							 rowHeight,
																							 columnWidth,
																							 scrollTop,
																							 containerHeight,
																							 instanceProps,
																							 scale,
																						 }: IRowStopIndex): number => {
	const a = getItemMetadata(
		{itemType: ItemType.row,
			rowHeight,
			columnWidth,
			index: startIndex,
			instanceProps,
			scale}
	)

	const itemMetadata = getItemMetadata({
		itemType: ItemType.row,
		rowHeight,
		columnWidth,
		index: startIndex,
		instanceProps,
		scale,
	});
	const maxOffset = scrollTop + containerHeight;

	let offset = itemMetadata.offset + itemMetadata.size;
	let stopIndex = startIndex;

	while (stopIndex < rowCount - 1 && offset < maxOffset) {
		stopIndex++;
		offset += getItemMetadata({
			itemType: ItemType.row,
			rowHeight,
			columnWidth,
			index: stopIndex,
			instanceProps,
			scale,
		}).size;
	}

	return stopIndex;
};


/**
 * Find next row Index
 * @param rowIndex
 * @param direction
 */
export type HiddenType = (i: number) => boolean;
export const clampIndex = (
	index: number,
	isHidden: HiddenType | undefined,
	direction
) => {
	switch (direction) {
		case Direction.Right:
		case Direction.Down:
			let hidden = isHidden?.(index);
			while (hidden === true) {
				hidden = isHidden?.(++index);
			}
			break;

		case Direction.Left:
		case Direction.Up: {
			let hidden = isHidden?.(index);
			while (hidden === true) {
				hidden = isHidden?.(--index);
			}
			break;
		}
	}
	return index;
};