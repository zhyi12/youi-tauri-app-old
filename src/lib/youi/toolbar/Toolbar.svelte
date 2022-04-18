<script lang="ts">
	/**
	 * Specify the toolbar size
	 * @type {"sm" | "default"}
	 */
	export let size = "default";

	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	let ref = null;

	const overflowVisible = writable(false);

	setContext("Toolbar", {
		overflowVisible,
		setOverflowVisible: (visible) => {
			overflowVisible.set(visible);
			if (ref) ref.style.overflow = visible ? "visible" : "inherit";
		},
	});
</script>

<section
	bind:this="{ref}"
	aria-label="toolbar"
	class:youi-toolbar="{true}"
	class:youi-toolbar--small="{size === 'sm'}"
	class:youi-toolbar--normal="{size === 'default'}"
	{...$$restProps}
>
	<slot />
</section>

<style>
	section{
		height: 35px;
	}
</style>