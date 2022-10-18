<script lang="ts">
  /** Set to `true` to enable the active state */
  export let active = false;

  /** Set to `true` to enable the highlighted state */
  export let highlighted = false;

  export let itemStyle = 'option-item';
</script>

<div
  class:list-menu-item="{true}"
  class:active="{active}"
  class:option-item-highlighted="{highlighted}"
  {...$$restProps}
  on:click
  on:dblclick
  on:mouseenter
  on:mouseleave
>
  <div class={itemStyle}>
    <slot/>
  </div>
</div>
