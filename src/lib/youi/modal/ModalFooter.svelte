<script>
  import classnames from '../util/utils';

  let className = '';
  export { className as class };

  $: classes = classnames(className, 'modal-footer');
</script>

<div {...$$restProps} class={classes}>
  <slot />
</div>
