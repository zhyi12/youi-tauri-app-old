<script lang="ts">

  import {getContext} from "svelte";

  export let id = undefined;

  export let name = undefined;

  /** Specify the text to render*/
  export let text = "";

  /** Specify a link href */
  export let href = "";

  export let icon = "";

  /** Specify HTML to render using `@html` */
  export let html = "";

  export let itemClass:string = undefined;

  let treeContext = getContext("ListTree");

  let {selectedNodeId,selectNode} = treeContext?treeContext:{selectedNodeId:undefined,selectNode:undefined};

  import ListItem from "./ListItem.svelte";
</script>

<ListItem data-id={id} class={(itemClass||'') + (icon?(' icon-'+icon):'')+(selectedNodeId && $selectedNodeId === id ?' active':'') }
          >
  {#if text && !href}<span  class="item-text" on:click={(e)=>{
            selectNode && selectNode(id);
            e.stopPropagation();
   }}
  >{text}</span>{/if}
  {#if href}<a class:bx--link="{true}" href="{href}">{text || href}</a>{/if}
  {#if !text && html}{@html html}{/if}
  <slot />
</ListItem>
