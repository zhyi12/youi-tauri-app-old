<script lang="ts">
	import { dev } from '$app/env';

	import Header from '$lib/header/Header.svelte';
	import Config from "$lib/dialog/Config.svelte";
	import '../app.css';
	import '$lib/youi/styles//youi.bootstrap.css';
	import '$lib/youi/styles/youi.modal.css';

	import {onMount} from "svelte";
	import {mockDataManager} from "../lib/youi/mock/data";
	import {mockRegister} from "../data/register";
	import { invoke } from '@tauri-apps/api/tauri'
	import {listen} from "@tauri-apps/api/event";

	if(dev){
		mockDataManager.init();
		mockRegister();
	}

	let configOpen = false;
	let result = {records:[]};

	onMount(async ()=>{
		//加载desktop配置
		if (window && window['__TAURI_IPC__']){
			const configStr = await invoke('load_config');
			result = JSON.parse(configStr as string);

			await listen('open-config', event => {
				configOpen = true;
			});
		}
	});
</script>

<Header />

<main>
	<slot />
</main>

<Config bind:isOpen={configOpen} items={result.records}>

</Config>

<footer>

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
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
