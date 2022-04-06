<script lang="ts">
    import TreeNode from "./TreeNode.svelte";
    import Icon from "../icon/Icon.svelte";
    import caretRight from "../icons/caret-right";
    import caretDown from "../icons/caret-down";
    import {getContext} from "svelte";
    import {computeTreeLeafDepth} from "../util/tree.util";

    export let children = [];
    export let expanded = false;
    export let root = false;
    export let level = 0;
    export let datas = undefined;

    /** @type {string | number} */
    export let id = "";
    export let text = "";
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
        toggleNode,
    } = getContext("Tree");

    const offset = () => {
        const depth = computeTreeLeafDepth(refLabel);

        if (parent) return depth + 1;
        //if (icon) return depth + 2;
        return depth + 2.5;
    };

    $: parent = children.length>0;
    $: node = { id, text, expanded, leaf: !parent ,datas};

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${offset()}rem`;
        refLabel.style.paddingLeft = `${offset()}rem`;
    }

    /**
     * 是否可展开
     */
    function isExpandable(){
        return Array.isArray(children) && children.length>0;
    }

</script>

{#if root}
    {#each children as child (child.id)}
        {#if Array.isArray(child.children)}
            <svelte:self {...child} />
        {:else}
            <TreeNode leaf {...child} />
        {/if}
    {/each}
{:else}
   <li bind:this="{ref}" id="{id}"
           class="treeNode level-{level}" class:expandable={isExpandable} class:expanded
       class:selected="{$selectedNodeIds.includes(id)}"
       class:tree-parent-node="{true}"
       on:click|stopPropagation="{() => {
          if (disabled) return;
          clickNode(node);
        }}">
       <div class:tree-node-label="{true}" bind:this="{refLabel}">
           <span class:node-toggle="{true}" disabled="{disabled}"
                 on:click="{() => {
                  if (disabled) return;
                  expanded = !expanded;
                  expandNode(node, expanded);
                  toggleNode(node);
                }}">
<!--            <CaretDown16  class="toggle-icon{expanded?'-expanded':''}"/>-->
               <Icon data={expanded?caretDown:caretRight} x="50" y="50"></Icon>
          </span>
           <span>
               {text}
           </span>
       </div>
       {#if expanded}
           <ul role="group" class:bx--tree-node__children="{true}">
               {#each children as child (child.id)}
                   {#if Array.isArray(child.children) && child.children.length}
                       <svelte:self {...child} level={level+1}/>
                   {:else}
                       <TreeNode leaf {...child} level={level+1}/>
                   {/if}
               {/each}
           </ul>
       {/if}
   </li>
{/if}

<style>
    .treeNode{
        list-style: none;
    }

    .node-toggle{
        width: 12px;
        display: inline-block;
        text-align: center;
        cursor: pointer;
    }
</style>
