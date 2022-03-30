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
    {},
    { default: {} }
    > {}
