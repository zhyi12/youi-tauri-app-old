<script lang="ts">
	import Modal from '../modal/Modal.svelte';
	import ModalHeader from '../modal/ModalHeader.svelte';
	import Button from '../button/Button.svelte';
	import Form from './Form.svelte';
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let title = '编辑';
	export let method = 'post';
	export let formRecord;
	export let action = '/users';

	let dispatch = createEventDispatcher();

	const toggle = () => isOpen = !isOpen;
	const afterSubmit = ()=>{
		isOpen = false;
		dispatch('afterSubmit',formRecord);
		return true;
	};
</script>

<Modal {isOpen}>
	<ModalHeader {toggle}>{title}</ModalHeader>
	<Form {formRecord} {action} {method} on:afterSubmit={afterSubmit}>
		<div class="modal-body">
			<slot></slot>
		</div>
		<div class="modal-footer">
			<Button color="primary" type='submit'>提交</Button>
			<Button color="secondary" type="submit" on:click={toggle}>取消</Button>
		</div>
	</Form>
</Modal>