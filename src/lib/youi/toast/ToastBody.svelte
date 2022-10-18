<script>
  import classnames from '../util/utils';

  let className = '';
  export { className as class };

  $: classes = classnames(className, 'toast-body');
</script>

<div {...$$restProps} class={classes}>
  <slot />
</div>
