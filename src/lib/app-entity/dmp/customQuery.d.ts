export interface CustomQuery{
    id:number,
    name:string,
    query_app:string,
    query_group:string,
    query_path:string,
    caption:string
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
    selectedColumns?:string[]
}

export interface Column{
    name:string,
    text:string,
    dataType?:string
}