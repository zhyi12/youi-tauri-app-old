<script lang="ts">
	import Konva from 'konva'
	import { getContext, onMount, setContext, createEventDispatcher } from 'svelte';
	import context from './context';
	import {EVENTS} from "./util";

	const dispatch = createEventDispatcher()
	export let x : number = null
	export let y : number = null
	// width and height not support on layer, despite being in type
	export let visible : boolean = null
	export let listening : boolean = null
	export let id : string = null
	export let name : string = null
	export let opacity : number = null
	export let scale : Konva.Vector2d = { x: null, y: null }
	export let scaleX : number = null
	export let scaleY : number = null
	export let rotation : number = null
	export let offset : Konva.Vector2d = { x: null, y: null }
	export let offsetX : number = null
	export let offsetY : number = null
	export let draggable : boolean = null
	export let dragDistance : number = null
	export let dragBoundFunc : (pos: Konva.Vector2d) => Konva.Vector2d = null
	let layer : Konva.Layer
	const parent : () => Konva.Container = getContext(context.parent)
	setContext(context.parent, () => layer)
	onMount(() => {
		layer = new Konva.Layer({
			x, y, visible, listening, id, name, opacity, scale, scaleX,
			scaleY, rotation, offset, offsetX, offsetY, draggable, dragDistance, dragBoundFunc
		})
		const to = parent()
		to.add(layer)
		dispatch('added', { layer, to })

		EVENTS.forEach((eventName)=>{
			layer.on(eventName, function (e) {
				dispatch(eventName,{container:to,target:e.target});
			});
		});

		return () => {
			layer.destroy()
			layer = null
		}
	})
	$: layer && layer.x(x)
	$: layer && layer.y(y)
	$: layer && layer.visible(visible)
	$: layer && layer.listening(listening)
	$: layer && layer.id(id)
	$: layer && layer.name(name)
	$: layer && layer.opacity(opacity)
	$: layer && layer.scale(scale)
	$: layer && layer.scaleX(scaleX)
	$: layer && layer.scaleY(scaleY)
	$: layer && layer.rotation(rotation)
	$: layer && layer.offset(offset)
	$: layer && layer.offsetX(offsetX)
	$: layer && layer.offsetY(offsetY)
	$: layer && layer.draggable(draggable)
	$: layer && layer.dragDistance(dragDistance)
	$: layer && layer.dragBoundFunc(dragBoundFunc)
</script>

{#if layer}
	<slot/>
{/if}