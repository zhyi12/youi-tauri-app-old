<script>
  import classnames from '../util/utils';

  let className = '';
  export let responsive = false;

  $: responsiveClassName = classnames(className, {
    'table-responsive': responsive === true,
    [`table-responsive-${responsive}`]: typeof responsive === 'string'
  });
</script>

{#if responsive}
  <div class={responsiveClassName}><slot /></div>
{:else}
  <slot />
{/if}
