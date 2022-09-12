<script>
  import classnames from '../util/utils';

  let className = '';
  export { className as class };

  $: classes = classnames(className, 'offcanvas-body');
</script>

<div {...$$restProps} class={classes}>
  <slot />
</div>
