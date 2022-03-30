<script lang="ts">
    import TreeNode from "./TreeNode.svelte";
    import Icon from "../icon/Icon.svelte";
    import caretRight from "../icons/caret-right";
    import caretDown from "../icons/caret-down";

    export let children = [];
    export let expanded = false;
    export let root = false;
    export let level = 0;

    /** @type {string | number} */
    export let id = "";
    export let text = "";
    export let disabled = false;

    let ref = null;
    let refLabel = null;
    let items = children;

    $: parent = children.length>0;
    $: node = { id, text, expanded, leaf: !parent };

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${level+1}rem`;
        refLabel.style.paddingLeft = `${level+1}rem`;
    }

    function toggleNode(){
        expanded = !expanded;
        console.log('toggle')
    }

    /**
     * 是否可展开
     */
    function isExpandable(){
        return Array.isArray(children);
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
           class="treeNode level-{level}" class:expandable={isExpandable} class:expanded >
       <div class:tree-node-label="{true}" bind:this="{refLabel}">
           <span class:node-toggle="{true}" disabled="{disabled}" on:click="{() => {if (disabled) return;toggleNode(node); }}">
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
                   {#if Array.isArray(child.children)}
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
