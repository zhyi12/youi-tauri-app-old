<script lang="ts">

	import Header from '$lib/header/Header.svelte';
	import LeftMenu from "$lib/menu/LeftMenu.svelte";

	import type {MenuInfo} from "$lib/app-entity/base/menu";
	import '../app.css';
	import '../main.scss';
	import {onMount, setContext} from "svelte";
	import {listen} from "../lib/tauri/event";
	import {writable} from "svelte/store";
	import {page} from "$app/stores";

	export let data;

	let menus:Array<MenuInfo> = data.menus;
	let activeModule:string = data.activeModule;

	let authorized = true;//是否已经登录授权

	let context = {baseDir:'/Volumes/D/youi-app-data'};//应用上下文

	let appContext = writable({});

	$: appContext.set(context);

	setContext('appContext',{
		appContext
	});

	onMount(async ()=>{
		let localAuthorized= window.localStorage.getItem("authorized");
		if(localAuthorized){
			authorized = true;
		}
		//监听app login消息
		let unlisten = listen("app-login",({payload})=>{
			//返回登录信息
			authorized = true;
			window.localStorage.setItem("authorized","true");
			//刷新页面，重新加载用户登录数据
			window.location.reload();
		});

		return async ()=>{
			await unlisten
		}
	});
</script>

{#if authorized}
	<LeftMenu {menus} {activeModule}/>

	<div class="content flex-1">
		<Header pathname={$page.url.pathname} />
		<main class="content flex-1 flex-row flex-full">
			<slot/>
		</main>
	</div>
{:else }
	login...
{/if}


