<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte';
	import classnames from '../util/utils';

	export let method = 'post';
	export let formRecord;
	let className = '';
	export { className as class };
	export let beforeSubmit = (record)=>true;

	let fields = [];
	let dispatch = createEventDispatcher();
	let refForm:HTMLFormElement;
	$: classes = classnames(className,'youi-form');

	setContext('FieldContainer',{
		addField:(field)=>{
			fields.push(field);
		}
	});

	/**
	 *
	 */
	export async function submit(){
		let url = refForm.action;
		if(url){
			const valid = await formValidate();
			//数据校验
			if(valid && beforeSubmit(formRecord)){
				//const result = await post(url,formRecord);
				dispatch('afterSubmit',{});
			}
		}

		return null;
	}

	/**
	 * 表单校验
	 * 根据 validating is-invalid 样式判断校验情况
	 * 1 is-invalid：存在校验失败
	 * 2 validating：校验中，用于远程异步校验
	 */
	let errors = [];
	async function formValidate(){
		let validate = true;
		errors = fields.map(field=>field.validate());
		console.log(errors)
		return validate;
	}

</script>

<form class={classes}
			{...$$restProps}
			bind:this={refForm}
			on:click
			on:keydown
			on:mouseover
			on:mouseenter
			on:mouseleave
			on:submit|preventDefault = {submit}>
	<slot></slot>
</form>