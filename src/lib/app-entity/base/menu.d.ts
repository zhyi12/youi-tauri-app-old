export interface MenuInfo {
    id:string,
    name:string,
    text:string,
    module?:string,
    href?:string,
    icon?:string,
    scale?:number,
    children?:Array<MenuInfo>
}