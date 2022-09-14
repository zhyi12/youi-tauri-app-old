<script lang='ts'>

	import Konva from 'konva';
	import { createEventDispatcher, getContext, onMount, setContext } from 'svelte';
	import context from './context';
	import {EVENTS} from "./util";

	export let x: number = undefined;
	export let y: number = undefined;
	export let width: number = undefined;
	export let height: number = undefined;
	export let visible: boolean = undefined;
	export let listening: boolean = undefined;
	export let id: string = undefined;
	export let name: string = undefined;
	export let opacity: number = undefined;
	export let scale: Konva.Vector2d = { x: null, y: null };
	export let scaleX: number = undefined;
	export let scaleY: number = undefined;
	export let rotation: number = undefined;
	export let offset: Konva.Vector2d = { x: null, y: null };
	export let offsetX: number = undefined;
	export let offsetY: number = undefined;

	export let draggable: boolean = undefined;
	export let dragDistance: number = undefined;
	export let dragBoundFunc: (pos: Konva.Vector2d) => Konva.Vector2d = null;

	export let clipX: number = undefined;
	export let clipY: number = undefined;

	export let clipWidth: number = undefined;
	export let clipHeight: number = undefined;
	// export let clipFunc: () => {} = null;

	const dispatch = createEventDispatcher();
	const parent: () => Konva.Container = getContext(context.parent);

	let group: Konva.Group;

	setContext(context.parent, () => group);

	onMount(() => {
		group = new Konva.Group({
			x, y,width,height, visible, listening, id, name, opacity, scale, scaleX,
			scaleY, rotation,
			clipX,clipY,clipWidth,clipHeight,
			offset,offsetY, draggable, dragDistance, dragBoundFunc
		});

		const to = parent();
		to.add(group);

		dispatch('added', { group, to });

		if(draggable){
			EVENTS.forEach((eventName)=>{
				group.on(eventName, function (e) {
					dispatch(eventName,e);
				});
			});
		}

		return () => {
			group.destroy();
			group = null;
		};
	});

	$: group && group.offsetX(offsetX);
	$: group && group.offsetY(offsetY);

	$: group && group.id(id);
	$: group && group.name(name);
	$: group && group.x(x);
	$: group && group.y(y);


</script>
{#if group}
	<slot/>
{/if}