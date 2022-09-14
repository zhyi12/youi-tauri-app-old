export type FlowNode = {
    id:string,
    name?:string,
    text?:string,
    x?:number,
    y?:number,
    width?:number,
    height?:number
};

export type Transition = {
    id:string,
    name?:string,
    from:string,
    to:string,
    g?:Array<Point>
}

export type Point = {
    x:number,
    y:number
};