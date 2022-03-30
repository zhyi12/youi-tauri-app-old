<script lang='ts'>

	import Konva from 'konva';
	import { createEventDispatcher, getContext, getAllContexts, onMount, setContext } from 'svelte';
	import context from './context';

	export let x: number;
	export let y: number;
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

	export let clipX: number;
	export let clipY: number;

	export let clipWidth: number;
	export let clipHeight: number;
	export let clipFunc: () => null;

	const dispatch = createEventDispatcher();
	const parent: () => Konva.Container = getContext(context.parent);

	let group: Konva.Group;

	setContext(context.parent, () => group);

	onMount(() => {
		group = new Konva.Group({
			x, y, visible, listening, id, name, opacity, scale, scaleX,
			scaleY, rotation,
			clipX,clipY,clipWidth,clipHeight,
			offset,offsetY, draggable, dragDistance, dragBoundFunc
		});

		const to = parent();
		to.add(group);

		dispatch('added', { group, to });
		return () => {
			group.destroy();
			group = null;
		};
	});

	$: group && group.offsetX(offsetX);
	$: group && group.offsetY(offsetY);


</script>
{#if group}
	<slot/>
{/if}