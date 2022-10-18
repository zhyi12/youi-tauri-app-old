<script lang="ts">
	import Konva from 'konva';

	import {createEventDispatcher, onMount, setContext} from 'svelte';
	import context from './context';
	import {classnames, ContextMenu, mouse} from "../../youi/";
	import {EVENTS} from "./util";
	const dispatch = createEventDispatcher()
	let className = '';
	export { className as class };

	export let moused = false;//是否集成鼠标拖动

	export let x: number = null;
	export let y: number = null;
	export let width: number = null;
	export let height: number = null;
	export let visible: boolean = null;
	export let listening: boolean = null;
	export let id: string = null;
	export let name: string = null;
	export let opacity: number = null;
	export let scale: Konva.Vector2d = { x: null, y: null };
	export let scaleX: number = null;
	export let scaleY: number = null;
	export let rotation: number = null;
	export let offset: Konva.Vector2d = { x: null, y: null };
	export let offsetX: number = null;
	export let offsetY: number = null;
	export let draggable: boolean = null;
	export let dragDistance: number = null;
	export let dragBoundFunc: (pos: Konva.Vector2d) => Konva.Vector2d = null;

	export let cursor = 'default';

	export let stage: Konva.Stage = undefined;

	let container: HTMLElement;
	let contextMenu:HTMLElement;

	let contextMenuOpen = false;

	$: classes = classnames(className,'youi-stage');

	setContext(context.stage, () => stage);
	setContext(context.parent, () => stage);

	onMount(() => {
		if(!width){
			width = container.offsetWidth;
		}

		if(!height){
			height = container.offsetHeight;
		}

		stage = new Konva.Stage({
			container, x, y, width, height, visible, listening, id, name, opacity, scale, scaleX,
			scaleY, rotation, offset, offsetX, offsetY, draggable, dragDistance, dragBoundFunc
		});

		EVENTS.forEach((eventName)=>{
			stage.on(eventName, function (e) {
				dispatch(eventName,e);
			});
		});
		return () => {
			stage.destroy();
			stage = null;
		};
	});

	$: stage && stage.height(height);
	$: stage && stage.width(width);

	const handle_resize = (evt) => {
		height = container.offsetHeight;
		width = container.offsetWidth;
	}

	const normalMouseUp = (evt) => {
		//
		dispatch('normalMouseUp',{evt});
		contextMenuOpen = false;
	}

	const mouseStart = (evt) => {
		dispatch('mouseStart',{evt});
	}

	const mouseDrag = (evt) => {
		dispatch('mouseDrag',{evt});
	}

	const mouseStop = (evt) => {
		dispatch('mouseStop',{evt});
		contextMenuOpen = false;
	}

</script>

<svelte:window on:resize={handle_resize}></svelte:window>

<div class={classes} bind:this={container} style:cursor={cursor}
	 use:mouse={moused?{
	normalMouseUp,mouseStart,mouseDrag,mouseStop,delay:100
}:{}}>
	{#if stage}
		<slot/>
	{/if}
</div>

<ContextMenu bind:open={contextMenuOpen} bind:ref={contextMenu} target={container}
			 on:open={({detail})=>{
				 dispatch('open-contextmenu',detail);
			 }}>
	<slot name="contextmenu">

	</slot>
</ContextMenu>