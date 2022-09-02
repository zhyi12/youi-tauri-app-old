<script lang="ts">

	import { getContext } from 'svelte';

	export let property = '';
	export let caption = '';
	export let type = undefined;
    export let format = undefined;
	export let display = null;
	export let columns = [];
    export let width = undefined;
    export let href = undefined;

	getContext('DataTable').addCol({
		property,
		caption,
		type,
		display,
		columns,
        width,
        href,
        format
	});

</script>

<slot>

</slot>