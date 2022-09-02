<script lang="ts">

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

  import ListItem from "./ListItem.svelte";
</script>

<ListItem data-id={id||name} class={(itemClass||'')+ (icon?(' icon-'+icon):'')}>
  {#if text && !href}{text}{/if}
  {#if href}<a class:bx--link="{true}" href="{href}">{text || href}</a>{/if}
  {#if !text && html}{@html html}{/if}
  <slot />
</ListItem>
