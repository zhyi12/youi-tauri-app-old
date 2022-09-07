<script lang="ts">

	import classnames from '../util/utils';
	import Label from '../Label.svelte';
	import {setContext} from "svelte";

	let className = '';
	export { className as class };
	export let caption = '';
	export let labelWidth = '6rem';
	export let inputGroup = false;

	$: classes = classnames(className,'youi-form-item');
	$: style = `width: ${labelWidth}`;
	$: labelClasses = classnames('',notNull?'notNull':'',inputGroup?'input-group-text':'');

	let notNull = false;
	setContext('FieldItem',{
		caption,
		setNotNull:function(){
			notNull = true;
		}
	});

</script>

<div class={classes}>
	{#if caption}
		<Label class={labelClasses} {style}>{caption}</Label>
	{/if}
	<slot></slot>
</div>
