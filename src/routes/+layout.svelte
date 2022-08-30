<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import LeftMenu from "$lib/menu/LeftMenu.svelte";
	import type {MenuInfo} from "$lib/app-entity/base/menu";

	import '../app.css';

	export let data;

	let menus:Array<MenuInfo> = data.menus;


</script>

<LeftMenu {menus}/>

<div class="flex-container flex-column">
	<Header />
	<main>
		<slot/>
	</main>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
