<script lang="ts">

	import Header from '$lib/header/Header.svelte';
	import LeftMenu from "$lib/menu/LeftMenu.svelte";

	import type {MenuInfo} from "$lib/app-entity/base/menu";
	import '../app.css';
	import '../main.scss';

	export let data;

	let menus:Array<MenuInfo> = data.menus;
	let activeModule:string = data.activeModule;

</script>

<LeftMenu {menus} {activeModule}/>

<div class="content flex-1">
	<Header />
	<main class="content flex-1 flex-row flex-full">
		<slot/>
	</main>
</div>

