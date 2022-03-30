<script lang="ts">

	import Box from './Box.svelte';
	import { toPixel } from '../util/utils';

	export let x = 0;
	export let y = 0;

	export let selectionBoxes = [];
	export let width = 0;
	export let height = 0;

</script>

<div style:left={toPixel(x)} style:top={toPixel(y)}
		 style="position:absolute;right:0;bottom:0;overflow:hidden">
	<div style:transform={'translate('+toPixel(x)*-1+', '+toPixel(y)*-1+')'}>
		{#each selectionBoxes as box}
			<Box {...box}></Box>
		{/each}
	</div>
</div>