import { traverse } from '../util/tree.util';


export const resolvePath = (object, path) =>
	path
		.split(/[.[\]'"]/)//.split(/[\.\[\]\'\"]/)
		.filter((p) => p)
		.reduce((o, p) => (o && typeof o === "object" ? o[p] : o), object);

/**
 * 构建表头显示实列集合
 * @param treeColumns 多级列
 */
export function buildShowColumns(treeColumns){
	let showColumns = [];
	if(treeColumns.length){
		const allColumns = traverse(treeColumns,false,'columns');
		let nodePathMap = {};
		allColumns.forEach(column=>{
			nodePathMap[column.level] = column;
			if(column.leaf){
				Object.assign(column,{groupTexts:_findGroupTexts(nodePathMap,column)});
				showColumns.push(column);
			}
		});
	}
	return showColumns;
}

/**
 * 表头分组
 * @param showColumns
 */
export function buildHeaderRows(showColumns){
	const rowHeaders = [];
	let maxLevel = 1;

	showColumns.forEach(groupColumn=>{
		maxLevel = Math.max(groupColumn.level,maxLevel);
	});
	/** 列表头对象集合 */
	const headers = _buildHeaders(showColumns,maxLevel);

	/** 列表头单元格处理 */
	for(let i=0;i<maxLevel;i++){
		const rowHeader = {cells:[]};
		headers.forEach((header,index)=>{
			const text = header.column.groupTexts[i];
			//
			if(text){
				const rowspan = header.column.groupTexts.length==i+1?header.expandedRowspan:1;
				let colspan = 1;
				if(header.columnColspanList[i]){
						colspan = header.columnColspanList[i];
				}

				if(colspan>0){
					rowHeader.cells.push({
						text:text,
						colspan:colspan,
						rowspan:rowspan,
						index:index,
						width:header.column.width||'',
						href:header.column.href
					});
				}
			}
		});

		rowHeaders.push(rowHeader);
	}

	return rowHeaders;
}

function _buildHeaders(showColumns,maxLevel){
	/** 列文本路径集合  */
	const joinGroupTexts = showColumns.map(groupColumn=>'/'+groupColumn.groupTexts.join('/'));
	/** 非叶子节点路径 */
	const groupPathTexts = _findGroupPathTexts(showColumns);
	/** 非叶子节点列占位map */
	const calculatedGroupPathColspanMap = {};

	/** 列表头模型 */
	return showColumns.map(groupColumn=>{
		const expandedRowspan = maxLevel - groupColumn.groupTexts.length+1;
		let columnColspanList = [];
		let paths = [];
		if(groupColumn.groupTexts.length>1){
			const pathText = '/'+groupColumn.groupTexts.slice(0,groupColumn.groupTexts.length-1).join('/');

			if(groupPathTexts.includes(pathText)){
				paths = _findPaths(groupColumn.groupTexts);
				columnColspanList = paths.map((path,index)=>{
					if(!calculatedGroupPathColspanMap[path]){
						calculatedGroupPathColspanMap[path] = _calculateColspan(path,joinGroupTexts);
						return calculatedGroupPathColspanMap[path];
					}else{
						return -1;
					}
				});
			}
		}
		return {column:groupColumn,expandedRowspan:expandedRowspan,columnColspanList:columnColspanList,paths:paths};
	});
}

/**
 *
 * @param path
 * @param joinGroupTexts
 */
function _calculateColspan(path,joinGroupTexts){
	return joinGroupTexts.filter(joinGroupText=>joinGroupText.indexOf(path)==0).length;
}

/**
 *
 * @param showColumns
 */
function _findGroupPathTexts(showColumns){
	const arr = showColumns.map(groupColumn=>_findPaths(groupColumn.groupTexts)).flat();
	return  Array.from(new Set(arr));
}

/**
 *
 * @param texts
 */
function _findPaths(texts){
	const paths = [];
	for(let i=1;i<texts.length;i++){
		paths.push('/'+texts.slice(0,i).join('/'));
	}
	return paths;
}

/**
 *
 * @param nodePathMap
 * @param column
 */
function _findGroupTexts(nodePathMap,column){
	const texts = [];
	for(let i=0;i<column.level;i++){
		if(nodePathMap[i]){
			texts.push(nodePathMap[i].caption);
		}
	}
	texts.push(column.caption);
	return texts;
}