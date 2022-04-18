import type {ItemType} from "./util";
import type {ShapeConfig} from "konva/lib/Shape";

export enum Direction {
	Up = "UP",
	Down = "DOWN",
	Left = "LEFT",
	Right = "RIGHT",
}

export interface IItemMetaData {
	itemType: ItemType;
	offset: number;
	index: number;
	rowCount: number;
	columnCount: number;
	rowHeight: ItemSizer;
	columnWidth: ItemSizer;
	instanceProps: InstanceInterface;
	scale: number;
}

export type ScrollCoords = {
	scrollTop: number;
	scrollLeft: number;
};

export type OptionalScrollCoords = {
	scrollTop?: number;
	scrollLeft?: number;
};

export interface ScrollState extends ScrollCoords {
	isScrolling: boolean;
	verticalScrollDirection: Direction;
	horizontalScrollDirection: Direction;
}

export type CellPosition = Pick<ShapeConfig, "x" | "y" | "width" | "height">

export interface RendererProps
	extends CellInterface,
		CellPosition,
		Omit<ShapeConfig, "scale"> {
	key: String;
	isMergedCell?: boolean;
	isOverlay?: boolean;
}

export type ItemSizer = (index: number) => number;

export interface AreaProps {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface SelectionArea extends AreaStyle {
	bounds: AreaProps;
	inProgress?: boolean;
	/**
	 * When user drags the fill handle
	 */
	isFilling?: boolean;
}


export interface CellInterface {
	rowIndex: number;
	columnIndex: number;
}

export interface OptionalCellInterface {
	rowIndex?: number;
	columnIndex?: number;
}

export interface ViewPortProps {
	rowStartIndex: number;
	rowStopIndex: number;
	columnStartIndex: number;
	columnStopIndex: number;
	visibleRowStartIndex: number;
	visibleRowStopIndex: number;
	visibleColumnStartIndex: number;
	visibleColumnStopIndex: number;
}

export interface InstanceInterface {
	columnMetadataMap: CellMetaDataMap;
	rowMetadataMap: CellMetaDataMap;
	lastMeasuredColumnIndex: number;
	lastMeasuredRowIndex: number;
	estimatedRowHeight: number;
	estimatedColumnWidth: number;
	recalcColumnIndices: number[];
	recalcRowIndices: number[];
}

export type CellMetaDataMap = Record<number, CellMetaData>;
export type CellMetaData = {
	offset: number;
	size: number;
};

export interface SnapRowProps {
	deltaY: number;
}

export interface SnapColumnProps {
	deltaX: number;
}

export interface PosXY {
	x?: number;
	y?: number;
}

export interface PosXYRequired {
	x: number;
	y: number;
}

export type MergedCellMap = Map<string, AreaProps>;

export type StylingProps = AreaStyle[];

export interface AreaStyle extends AreaMeta {
	bounds: AreaProps;
	style?: Style;
	strokeStyle?: "dashed" | "solid" | "dotted";
}
export interface AreaMeta {
	title?: string;
	[key: string]: any;
}

export interface Style {
	stroke?: string;
	strokeLeftColor?: string;
	strokeTopColor?: string;
	strokeRightColor?: string;
	strokeBottomColor?: string;
	strokeWidth?: number;
	strokeTopWidth?: number;
	strokeRightWidth?: number;
	strokeBottomWidth?: number;
	strokeLeftWidth?: number;
	strokeStyle?: string;
}

interface ScrollSnapRef {
	visibleRowStartIndex: number;
	rowCount: number;
	frozenRows: number;
	visibleColumnStartIndex: number;
	columnCount: number;
	frozenColumns: number;
	isHiddenRow?: (rowIndex: number) => boolean;
	isHiddenColumn?: (columnIndex: number) => boolean;
}

export interface IRowStopIndex
	extends Omit<IItemMetaData, "itemType" | "index" | "offset" | "columnCount"> {
	startIndex: number;
	containerHeight: number;
	scrollTop: number;
}

export interface IColumnStopIndex
	extends Omit<IItemMetaData, "itemType" | "index" | "offset" | "rowCount"> {
	startIndex: number;
	containerWidth: number;
	scrollLeft: number;
}