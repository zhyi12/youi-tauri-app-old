<script lang='ts'>
    import TreeNode from './TreeNode.svelte';
    import Icon from '../icon/Icon.svelte';
    import caretRight from '../icons/caret-right';
    import caretDown from '../icons/caret-down';
    import { afterUpdate, getContext } from 'svelte';
    import { computeTreeLeafDepth } from '../util/tree.util';

    export let children = [];
    export let expanded = false;
    export let root = false;
    export let level = 0;
    export let datas = undefined;
    export let loaded = true;

    /** @type {string | number} */
    export let id = '';
    export let text = '';
    export let icon = undefined;
    export let disabled = false;

    let ref = null;
    let refLabel = null;
    let items = children;

    let prevActiveId = undefined;

    const {
        activeNodeId,
        selectedNodeIds,
        expandedNodeIds,
        clickNode,
        selectNode,
        expandNode,
        focusNode,
        toggleNode
    } = getContext('Tree');

    const offset = () => {
        const depth = computeTreeLeafDepth(refLabel);
        if (parent) return depth + 1;
        //if (icon) return depth + 2;
        return depth + 2.5;
    };

    $: parent = children && children.length > 0;
    $: node = { id, text, expanded, leaf: loaded && !parent, loaded, datas };

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${offset()}rem`;
        refLabel.style.paddingLeft = `${offset()}rem`;
    }
    $: expanded = $expandedNodeIds.includes(id);

    /**
     * 是否可展开
     */
    function isExpandable() {
        return (!loaded) || (Array.isArray(children) && children.length > 0);
    }

    const toggle = async () => {
        if (disabled) return;
        expanded = !expanded;

        if (loaded == false) {
            const result = await expandNode(node, expanded, id, level);
            if (result) {
                loaded = true;
                children = result || [];
            }
        }
        node.expanded = expanded;
        toggleNode(node);
    };

    /**
     *
     */
    afterUpdate(() => {
        if (id === $activeNodeId && prevActiveId !== $activeNodeId) {
            if (!$selectedNodeIds.includes(id)) selectNode(node);
        }
        prevActiveId = $activeNodeId;
    });
</script>

{#if root}
    {#each children as child (child.id)}
        {#if child.loaded == false}
            <svelte:self {...child} />
        {:else if Array.isArray(child.children) && child.children.length > 0}
            <svelte:self {...child} />
        {:else}
            <TreeNode leaf {...child} />
        {/if}
    {/each}
{:else}
    <li bind:this='{ref}' id='{id}' class:with-icon={icon}
        class='treeNode level-{level}' class:expandable={isExpandable} class:expanded
        class:selected='{$selectedNodeIds.includes(id)}'
        class:tree-parent-node='{true}'
        on:click|stopPropagation='{() => {
          if (disabled) return;
          clickNode(node);
        }}'>
        <div class:tree-node-label='{true}' bind:this='{refLabel}'>
           <span class:node-toggle='{true}' disabled='{disabled}'
                 on:click='{toggle}'>
               <Icon data={expanded?caretDown:caretRight} class='toggle-icon'></Icon>
          </span>
            <span class='detail' on:dblclick={toggle} title={text}>
               {#if icon}
                   <span><Icon data={icon} class='node-icon'></Icon></span>
               {/if}
                {text}
           </span>
        </div>
        {#if expanded}
            <ul role='group' class:bx--tree-node__children='{true}'>
                {#each children as child (child.id)}
                    {#if !child.leaf && child.loaded == false}
                        <svelte:self {...child} level={level+1} />
                    {:else if (Array.isArray(child.children) && child.children.length)}
                        <svelte:self {...child} level={level+1} />
                    {:else}
                        <TreeNode leaf {...child} level={level+1} />
                    {/if}
                {/each}
            </ul>
        {/if}
    </li>
{/if}

<style>
    .treeNode {
        list-style: none;
    }

    .node-toggle {
        width: 12px;
        display: inline-block;
        text-align: center;
        cursor: pointer;
    }
</style>
