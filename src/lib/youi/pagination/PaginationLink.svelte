<script lang="ts">
  import classnames from '../util/utils';

  let className = '';
  export { className as class };
  export let next = false;
  export let previous = false;
  export let first = false;
  export let last = false;
  export let ariaLabel = '';
  export let href = '';

  $: classes = classnames(className, 'page-link');

  let defaultAriaLabel = '';

  $: realLabel = ariaLabel || defaultAriaLabel;

  let defaultCaret;
  $: if (previous) {
    defaultCaret = '\u2039';
  } else if (next) {
    defaultCaret = '\u203A';
  } else if (first) {
    defaultCaret = '\u00ab';
  } else if (last) {
    defaultCaret = '\u00bb';
  }
</script>

<a {...$$restProps} class={classes} on:click {href}>
  {#if previous || next || first || last}
    <span aria-hidden="true">
      <slot>{defaultCaret}</slot>
    </span>
    <span class="visually-hidden">{realLabel}</span>
  {:else}
    <slot />
  {/if}
</a>
