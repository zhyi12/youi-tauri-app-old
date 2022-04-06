<script lang="ts">
	import { dev } from '$app/env';

	import Header from '$lib/header/Header.svelte';
	import Config from "$lib/dialog/Config.svelte";
	import '../app.css';
	import '$lib/youi/styles/youi.bootstrap.css';
	import '$lib/youi/styles/youi.modal.css';
	import '$lib/youi/styles/youi.tree.css';

	import {onMount} from "svelte";
	import {mockDataManager} from "../lib/youi/mock/data";
	import {mockRegister} from "../data/register";
	import { invoke } from '@tauri-apps/api/tauri'
	import {listen} from "@tauri-apps/api/event";
	import {watch} from "../lib/youi/fs/fs-watcher";

	if(dev){
		mockDataManager.init();
		mockRegister();
	}

	let mainContainer:HTMLElement = null;
	let footer:HTMLElement = null;

	let configOpen = false;
	let result = {records:[]};

	let path = '/Volumes/D/data/local';
	let stopWatching = null;
	let response = '';

	onMount(async ()=>{
		//加载desktop配置
		if (window && window['__TAURI_IPC__']){
			const configStr = await invoke('load_config');
			result = JSON.parse(configStr as string);

			await listen('open-config', event => {
				configOpen = true;
			});

			stopWatching = await watch(path, { recursive: true }, updateResponse).catch(updateResponse)
		}

		mainContainer.style.height = (window.innerHeight - footer.offsetHeight - 80)+'px';
	});

	function updateResponse(returnValue) {
		response += `[${new Date().toLocaleTimeString()}]` + (typeof returnValue === 'string' ? returnValue : JSON.stringify(returnValue)) + '<br>'
	}
</script>

<Header />

<main bind:this={mainContainer}>
	<slot />
	<span>{response}</span>
</main>

<Config bind:isOpen={configOpen} items={result.records}>

</Config>

<footer bind:this={footer}>

</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		overflow: auto;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 10px 0;
		}
	}
</style>
