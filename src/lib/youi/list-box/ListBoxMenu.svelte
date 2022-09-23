<script context="module" lang="ts">
  /**
   * Finds the nearest list item
   * @param {HTMLElement} node
   * @returns {null | HTMLElement}
   */
  function findListItemNode(node) :HTMLElement{
    if(!node)return null;
    if (node.classList.contains("list-menu-item")) return node;
    if (node.classList.contains("list-box-menu")) return null;
    return findListItemNode(node.parentElement);
  }

  function findItemIndex(node){
    let index = -1;
    let prevNode = node;
    while (prevNode){
      index++;
      prevNode = prevNode.previousElementSibling;
    }
    return index;
  }
</script>

<script lang="ts">

  import {mouse} from "../mouse/mouse";
  import {createEventDispatcher} from "svelte";
  import {toPixel} from "../util/utils";

  /** Set an id for the top-level element */
  export let id = "ccs-" + Math.random().toString(36);

  /** Obtain a reference to the HTML element */
  export let ref = null;

  export let draggable = false;
  export let draggingItem = null;
  export let droppable = false;
  export let height:number = null;

  let dispatch = createEventDispatcher();
  let dragStart = null;
  let itemDragHelper = null;
  let offsetParent = null;


  const mouseStart = (e)=>{
    let item = findListItemNode(e.target);
    if(item){
      dragStart = item;
      offsetParent = ref.offsetParent;
      dispatch('dragStart',{index:findItemIndex(item)});
    }
  };

  const mouseDrag = (e)=>{
    if(dragStart && itemDragHelper){
      itemDragHelper.style.top = `${e.pageY+5-offsetParent.offsetTop}px`;
      itemDragHelper.style.left = `${e.pageX+5-offsetParent.offsetLeft}px`;
    }
  };

  const mouseStop = (e)=>{
    dispatch('dragStop',{target:e.target});
    dragStart = null;
    draggingItem = null;
    itemDragHelper = null;
  };

  const doDrop = (e)=>{
    dispatch('drop',e.detail.drop);
  }

</script>

<div use:mouse={{droppable,
  doDrop:droppable?doDrop:null,
   mouseStart:draggable?mouseStart:null,
   mouseDrag:draggable?mouseDrag:null,
   mouseStop:draggable?mouseStop:null}}
  bind:this="{ref}"
  role="listbox"
  id="menu-{id}"
     style:maxHeight={height?toPixel(height):''}
  class:list-box-menu="{true}"
  class:flex-1="{true}"
     class:youi-list-box="{true}"
  {...$$restProps}
  on:scroll
>
  <slot />
  {#if dragStart}
    <div class="item-drag-helper" bind:this={itemDragHelper}>{dragStart.innerText}</div>
  {/if}
</div>

<style>
  .item-drag-helper{
    position: absolute;
  }
</style>
