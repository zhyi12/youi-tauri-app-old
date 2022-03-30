<script lang="ts">

	import {is_function} from "svelte/internal";
	import type {Writable} from "svelte/store";

	export let store:Writable<any>;

	/**
	 *
	 */
	function handle_confirm(){
		if(is_function($store.confirm)){
			$store.confirm();
			handle_close();
		}
	}

	/**
	 *
	 */
	function handle_close() {
		store.update(t=>{
			Object.assign(t,{confirm:null,isOpen:false,type:''});
			return t;
		});
	}
</script>

<div class="modal fade youi-confirm" class:show={$store.isOpen} role="dialog">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header"><h5 class="modal-title">{$store.title||'提示'}</h5>
				<button type="button" class="btn-close" on:click={handle_close} aria-label="Close"></button>
			</div>
			<div class="modal-body">
				{$store.message}
			</div>
			<div class="modal-footer">
				{#if $store.type==='alert'}
					<button class="btn btn-secondary" value="" on:click={handle_close} style="">关闭</button>
				{:else}
					<button class="btn btn-primary" on:click={handle_confirm} value="" style="">确认</button>
					<button class="btn btn-secondary" value="" on:click={handle_close} style="">取消</button>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if $store.isOpen}
	<div class="modal-backdrop fade show" style="display: block;"></div>
{/if}

<style>
	.youi-confirm.show{
			display: block;
	}
</style>