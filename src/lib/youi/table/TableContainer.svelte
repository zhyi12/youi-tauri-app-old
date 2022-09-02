<script>
  /** Specify the title of the data table */
  export let title = "";

  /** Specify the description of the data table */
  export let description = "";

  /** Set to `true` to enable a sticky header */
  export let stickyHeader = false;

  /** Set to `true` to use static width */
  export let useStaticWidth = false;
</script>

<div
  class:data-table-container="{true}"
  class:data-table-container--static="{useStaticWidth}"
  class:data-table--max-width="{stickyHeader}"
  {...$$restProps}
>
  {#if title}
    <div class:data-table-header="{true}">
      <h4 class:data-table-header__title="{true}">{title}</h4>
      <p class:data-table-header__description="{true}">{description}</p>
    </div>
  {/if}
  <slot />
</div>
