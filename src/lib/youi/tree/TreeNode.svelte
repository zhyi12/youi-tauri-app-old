<script context='module' lang='ts'>
    /**
     * Finds the nearest parent tree node
     * @param {HTMLElement} node
     * @returns {null | HTMLElement}
     */
    function findParentTreeNode(node: HTMLElement) {
        if (node.classList.contains('tree-parent-node')) return node;
        if (node.classList.contains('youi-tree')) return null;
        return findParentTreeNode(node.parentNode as HTMLElement);
    }
</script>

<script lang='ts'>

    import { afterUpdate, getContext } from 'svelte';
    import { computeTreeLeafDepth } from '../util/tree.util';
    import Icon from '../icon/Icon.svelte';

    export let leaf = false;
    export let disabled = false;
    export let id = '';
    export let text = '';
    export let html = '';
    export let level = 0;
    export let icon: unknown;
    export let datas: unknown = undefined;
    export let children: unknown = undefined;
    export let loaded = true;
    export let expanded = false;

    let ref: HTMLElement = null;
    let refLabel: HTMLElement = null;
    let prevActiveId: string = undefined;

    const {
        activeNodeId,
        selectedNodeIds,
        clickNode,
        selectNode,
        focusNode
    } = getContext('Tree');

    const offset = () => computeTreeLeafDepth(refLabel) + (leaf && icon ? 2 : 2.5);

    $: node = { id, text, expanded, leaf, loaded, datas };

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${offset()}rem`;
        refLabel.style.paddingLeft = `${offset()}rem`;
    }

    $: classes = `treeNode ${icon ? 'with-icon' : ''} leaf level-${level}`;

    afterUpdate(() => {
        if (id === $activeNodeId && prevActiveId !== $activeNodeId) {
            if (!$selectedNodeIds.includes(id)) selectNode(node);
        }

        prevActiveId = $activeNodeId;
    });
</script>

<li class={classes} bind:this='{ref}' id='{id}'
    class:selected='{$selectedNodeIds.includes(id)}'

    on:click|stopPropagation='{() => {
    if (disabled) return;
    clickNode(node);
  }}'
    on:keydown="{(e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter') {
      e.stopPropagation();
    }

    if (e.key === 'ArrowLeft') {
      const parentNode = findParentTreeNode(ref.parentNode);
      if (parentNode) parentNode.focus();
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (disabled) return;
      clickNode(node);
    }
  }}"
    on:focus='{() => {
    focusNode(node);
  }}'
>
    <div bind:this='{refLabel}' class:tree-node-label='{true}'>
        {#if icon}
            <Icon style='margin-top:-3px;' class='node-icon' data={icon}></Icon>
        {/if}
        {#if text}<span title={text}>{text}</span>{/if}
        {#if !text && html}<span>{@html html}</span>{/if}
    </div>
</li>

