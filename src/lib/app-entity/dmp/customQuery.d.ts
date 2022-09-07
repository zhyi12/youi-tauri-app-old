export interface CustomQuery{
    id:number,
    caption:string,
    name?:string,
    query_app?:string,
    query_group?:string,
    query_path?:string
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
    selectedColumns?:string[],
    conditions?:Condition[],
    orders?:Order[],
    joinHow?:string,
    joinColumns?:JoinColumn[]//连接列
}

export interface Column{
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