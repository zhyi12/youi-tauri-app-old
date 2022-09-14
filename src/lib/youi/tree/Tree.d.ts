export interface TreeNode{
    id:string,
    text:string,
    html?:string,
    children?:TreeNode[],
    group?:string,
    icon?:string,
    href?:string,
    datas?:Record<string, unknown>
}

import { SvelteComponentTyped } from 'svelte';

export type TreeNodeProps =
    | string
    | number
    | {
    id?: string;
    text?: string;
};

export default class TreeNode extends SvelteComponentTyped<
    TreeNodeProps,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    { default: {} }
    > {}
