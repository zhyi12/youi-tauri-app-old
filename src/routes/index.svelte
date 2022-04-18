<script context="module" lang="ts">
	export const prerender = true;
	export const ssr = false;
</script>

<script lang="ts">
	import {onMount} from "svelte";
	import ConditionTree from "$lib/youi/condition/ConditionTree.svelte";

	let children = [{name:'and',id:'root',text:'且'}];

	let show:string = undefined;

	onMount(async ()=>{
		//
	});

</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div>

</div>

