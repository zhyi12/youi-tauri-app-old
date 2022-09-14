<script lang="ts">
	import Konva from 'konva';

	import {createEventDispatcher, onMount, setContext} from 'svelte';
	import context from './context';
	import classnames from "../../youi/util/utils";
	import {EVENTS} from "./util";
	const dispatch = createEventDispatcher()
	let className = '';
	export { className as class };

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

	$: classes = classnames(className,'youi-stage');

	let container: HTMLDivElement;

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

</script>

<div class={classes} bind:this={container}  style:cursor={cursor}>
	{#if stage}
		<slot/>
	{/if}
</div>