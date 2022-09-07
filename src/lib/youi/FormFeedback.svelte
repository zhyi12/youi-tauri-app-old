<script>
  import classnames from './util/utils';

  let className = '';
  export { className as class };
  export let valid = undefined;
  export let tooltip = false;
  let classes;

  $: {
    const validMode = tooltip ? 'tooltip' : 'feedback';

    classes = classnames(
      className,
      valid ? `valid-${validMode}` : `invalid-${validMode}`
    );
  }
</script>

<div {...$$restProps} class={classes}>
  <slot />
</div>
