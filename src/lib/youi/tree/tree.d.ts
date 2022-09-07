export interface TreeNode{
    id:string,
    text:string,
    html?:string,
    children?:TreeNode[],
    icon?:string,
    href?:string,
    datas?:Record<string, unknown>
}