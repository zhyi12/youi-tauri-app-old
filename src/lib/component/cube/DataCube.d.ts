/**
 * 维度
 */
export interface Dimension<T extends Item>{
    id:string,
    name:string,
    text:string,
    items:T[]
}

/**
 * 维度项
 */
export interface Item{
    id:string,
    name:string,
    text:string,
    dimId?:string,
    level?:number,
    expression?:string,
}
/**
 * 计量
 */
export interface Measure extends Dimension<MeasureItem>{
    prefix?:string
}
/**
 * 计量项
 */
export interface MeasureItem extends Item{
    aggregate:string
}

export interface CrossItem{
    items:SpanItem[]
}

export interface SpanItem extends Item{
    first?:boolean,
    spans?:number,
    itemCount?:number,
}

/**
 * 分组
 */
export interface Group extends Dimension<GroupItem>{
    expression:string
}
/**
 * 分组项
 */
export interface GroupItem {
    id:string,
    name:string,
    text:string,
    expression?:string,
}