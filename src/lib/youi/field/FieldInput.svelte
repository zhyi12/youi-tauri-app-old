<script lang="ts">
	import Input from '../Input.svelte';
	import { getContext } from 'svelte';
	import classnames from "../util/utils";
	import {FIELD_CONTAINER_CONTEXT} from "./helper";

	let className = '';
	export { className as class };

	export let validators = [];
	export let property:string = undefined;
	export let notNull = false;
	export let value:string = undefined;
	export let placeholder:string = undefined;
	export let type = 'text';
	export let prefix = 'field';
	export let change = null;
	// export let children = [];
	export let readonly = false;

	let invalid = false;
	let invalidMessage = '';

	let context = getContext(FIELD_CONTAINER_CONTEXT);

	let filedContext = getContext('FieldItem');

	$: classes = classnames(className,'youi-field fieldText');

	if(context){
		context.addField({property:property,
			getValue:()=>{return value;},
			reset:()=>{value = ''},
			validate:async ()=>{
				const errors = await doValidate();
				return errors;
		}});
	}

	$: if(filedContext && notNull){
		filedContext.setNotNull();
	}

	/**
	 * 值校验
	 */
	async function doValidate(){
		invalid = false;
		invalidMessage = '';

		let errors = [];
		if(notNull && !value){
			errors.push((filedContext?filedContext.caption:'')+`不可为空`);
		}else{
			for (const validator of validators) {
				const error = await validator(value);
				if(error){
					errors.push(error);
				}
			}
		}
		if(errors.length){
			invalid = true;
			invalidMessage = errors.join('');
		}
		return errors;
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

<div class={classes}>

	<Input {type} title={invalidMessage}
				 name={property}
				 id={prefix+'_'+property}
				 invalid={invalid}
				 bind:value={value}
		   {readonly}
				 on:change={_change}
				 {placeholder}
	/>

</div>