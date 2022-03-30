
<script lang="ts">
	import classnames, { toPixel } from '../util/utils';

	let className = '';
	export { className as class };
	export let isOpen = false;

	$: classes = classnames(className, 'youi-field-editor',isOpen?'open':'');

	export let x = 0;
	export let y = 0;
	export let width = 0;
	export let height = 0;
	export let value = '';

</script>

<div class={classes}
		 style:position='absolute'
		 style:left={toPixel(x)}
		 style:top={toPixel(y)}
		 style:width={toPixel(width)}
		 style:height={toPixel(height)}
		 on:keydown
>
	<textarea rows="1" cols="1"
						style="font: 12px / 1.2 Arial; width: 100%; height: 100%; padding: 0px 1px; margin: 0px; box-sizing: border-box; border-width: 0px; outline: none; resize: none; overflow: hidden; vertical-align: top; background: transparent;"
						bind:value={value}/>

</div>