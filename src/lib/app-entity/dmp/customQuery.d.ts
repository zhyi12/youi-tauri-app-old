export interface CustomQuery{
    id?:number,
    caption:string,
    name?:string,
    query_app?:string,
    query_group?:string,
    folder_path?:string,
    content?:string
}

/**
 *
 */
export interface StepInfo{
    id:string,
    name:string,
    text:string,
    reader?:string,
    uri?:string,
    columns?:Column[],
    selectedColumns?:string[],//
    conditions?:Condition[],//过滤条件
    orders?:Order[],//排序条件
    joinHow?:string,//连接方式
    joinColumns?:JoinColumn[],//连接列
    groups?:Group[],//汇总分组
    measureItems?:MeasureItem[],//计量
    unions?:Reader[],//上下连接
}

export interface Column{
    id?:string,
    name:string,
    text:string,
    dataType?:string
}

/**
 *
 */
export interface JoinColumn{
    left:string,
    right:string,
    name:string
}

//id:'root',text:'且',name:'and',type:'conn'
export interface Condition{
    id:string,
    text:string,
    name:string,
    type:string,
    property?:string,
    operator?:string,
    value?:string|number,
    dataType?:string,
    level?:number,
    children?:Condition[]
}

export interface Order{
    property:string,
    descending?:boolean
}

export interface Group{
    name:string,
    text?:string
}

export interface MeasureItem{
    id:string,
    name:string,
    text:string,
    aggregate?:string,
    dataType?:string,
}

export interface Reader{
    name:string,
    uri:string,
    columns:Column[]
}