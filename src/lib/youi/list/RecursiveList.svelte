<script>

  import classnames from "../util/utils";
  import UnorderedList from "./UnorderedList.svelte";
  import OrderedList from "./OrderedList.svelte";
  import RecursiveListItem from "./RecursiveListItem.svelte";

  let className = '';
  export { className as class };

  /**
   * @typedef {{ text?: string; href?: string; html?: string; }} RecursiveListNode
   * @restProps {ul | ol}
   */

  /**
   * Specify the children to render
   * @type {Array<RecursiveListNode & { children?: RecursiveListNode[]; }>}
   */
  export let children = [];

  /**
   * item样式
   * @type {string}
   */
  export let itemClass = '';

  export let activeHref = '';

  /**
   * Specify the type of list to render
   * @type {"unordered" | "ordered" | "ordered-native"}
   */
  export let type = "unordered";

  $: classes = classnames("list", className);

</script>

<svelte:component
  this="{type === 'unordered' ? UnorderedList : OrderedList}"
  native="{type === 'ordered-native'}"
  class={classes}
  {...$$restProps}
>
  {#each children as child}
    {#if Array.isArray(child.children)}
      <RecursiveListItem itemClass = {activeHref===child.href?(itemClass+' active'):itemClass} {...child}>
        <svelte:self {...child} type="{type}" nested />
      </RecursiveListItem>
    {:else}
      <RecursiveListItem itemClass = {activeHref===child.href?(itemClass+' active'):itemClass} {...child} />
    {/if}
  {/each}
</svelte:component>
