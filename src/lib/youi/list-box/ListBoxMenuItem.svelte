<script>
  /** Set to `true` to enable the active state */
  export let active = false;

  /** Set to `true` to enable the highlighted state */
  export let highlighted = false;
</script>

<div
  class:list-menu-item="{true}"
  class:active="{active}"
  class:option-item-highlighted="{highlighted}"
  {...$$restProps}
  on:click
  on:mouseenter
  on:mouseleave
>
  <div class:option-item="{true}">
    <slot />
  </div>
</div>
