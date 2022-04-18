<script context="module">
    /**
     * Finds the nearest parent tree node
     * @param {HTMLElement} node
     * @returns {null | HTMLElement}
     */
    function findParentTreeNode(node) {
        if (node.classList.contains("tree-parent-node")) return node;
        if (node.classList.contains("youi-tree")) return null;
        return findParentTreeNode(node.parentNode);
    }
</script>

<script lang="ts">

    import {afterUpdate, getContext} from "svelte";
    import {computeTreeLeafDepth} from "../util/tree.util";
    import Icon from "../icon/Icon.svelte";
    import fileText from '../icons/file-text'

    export let leaf = false;
    export let disabled = false;
    export let id = "";
    export let text = "";
    export let level = 0;
    export let icon = undefined;
    export let datas = undefined;

    let ref = null;
    let refLabel = null;
    let prevActiveId = undefined;

    const {
        activeNodeId,
        selectedNodeIds,
        clickNode,
        selectNode,
        focusNode,
    } = getContext("Tree");

    const offset = () =>
        computeTreeLeafDepth(refLabel) + (leaf && icon ? 2 : 2.5);

    $: node = { id, text, expanded: false, leaf ,datas};

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${offset()}rem`;
        refLabel.style.paddingLeft = `${offset()}rem`;
    }

    afterUpdate(() => {
        if (id === $activeNodeId && prevActiveId !== $activeNodeId) {
            if (!$selectedNodeIds.includes(id)) selectNode(node);
        }

        prevActiveId = $activeNodeId;
    });
</script>

<li class="treeNode leaf level-{level}" bind:this="{ref}" id="{id}"
    class:selected="{$selectedNodeIds.includes(id)}"

    on:click|stopPropagation="{() => {
    if (disabled) return;
    clickNode(node);
  }}"
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
    on:focus="{() => {
    focusNode(node);
  }}"
>
    <div bind:this="{refLabel}" class:tree-node-label="{true}">
        <Icon data={fileText}></Icon>
        <span>{text}</span>
    </div>
</li>

<style>
    .treeNode{
        list-style: none;
    }
</style>