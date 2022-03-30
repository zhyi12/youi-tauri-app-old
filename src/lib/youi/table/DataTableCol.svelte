<script lang="ts">

	import { getContext } from 'svelte';

	export let property = '';
	export let caption = '';
	export let type = '';
	export let display = null;
	export let columns = [];

	getContext('DataTable').addCol({
		property:property,
		caption:caption,
		type:type,
		display:display,
		columns:columns
	});

</script>

<slot>

</slot>