<script lang="ts">
	import Input from '../input/Input.svelte';
	import { getContext } from 'svelte';
	import classnames from "../util/utils";

	let className = '';
	export { className as class };

	export let validators = [];
	export let property:string = undefined;
	export let notNull = false;
	export let value;
	export let placeholder:string = undefined;
	export let type = 'text';
	export let prefix = 'field';
	export let change = null;
	export let children = [];

	let invalid = false;

	let context = getContext('FieldContainer');

	$: classes = classnames(className,'youi-field fieldText');

	if(context){
		context.addField({property:property,validate:()=>{doValidate()}});
	}

	/**
	 * 值校验
	 */
	function doValidate(){
		invalid = false;
		if(notNull && !value){
			invalid = true;
		}else{
			for (const validator of validators) {
				const errors = validator(value);
				if(errors){
					invalid = true;
				}
			}
		}
		return invalid;
	}

	/**
	 * 值变化
	 */
	function _change(){
		doValidate();
		if(change){
			change(value);
		}
		_resetChildren();
	}

	function _resetChildren() {
		//resetChildren(children,property,value);
	}
</script>

<div class={classes} >

	<Input {type}
				 name={property}
				 id={prefix+'_'+property}
				 invalid={invalid}
				 bind:value={value}
				 on:change={_change}
				 {placeholder}
	/>

</div>