<script lang="ts">

	import classnames from '../util/utils';
	import Label from '../input/Label.svelte';

	let className = '';
	export { className as class };
	export let caption = '';

	$: classes = classnames(className,'youi-form-item');

</script>

<div class={classes}>
	<Label class="youi-form-item__label">{caption}</Label>
	<div class="youi-form-item__content">
		<slot></slot>
	</div>
</div>