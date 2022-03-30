<script lang="ts">

	import Konva from 'konva';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import context from './context';
	import { appendKonvaElement } from './util';

	export let text: string = null;
	export let textDecoration: string = null;
	export let stroke: string = null;

	export let x: number;
	export let y: number;
	export let width: number;
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

	const dispatch = createEventDispatcher();
	const parent: () => Konva.Container = getContext(context.parent);

	let element:Konva.Text = null;

	onMount(()=>{
		const parentElement = parent();
		const config = {x,y,width,height,offset,offsetX,offsetY,rotation,text,textDecoration,stroke};
		element = appendKonvaElement(parentElement,'Text',config);
		dispatch('added', { element, parentElement });
		return ()=>{
			element.destroy();
			element = null;
		}
	});

	$: element && element.text(text);
	$: element && element.x(x);
	$: element && element.y(y);
	$: element && element.width(width);
	$: element && element.height(height);

</script>