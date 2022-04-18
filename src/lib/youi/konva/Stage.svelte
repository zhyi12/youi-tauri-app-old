<script lang='ts'>
	import Konva from 'konva';

	import { onMount ,setContext} from 'svelte';
	import context from './context';

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

	export let stage: Konva.Stage;

	let container: HTMLDivElement;

	setContext(context.stage, () => stage);
	setContext(context.parent, () => stage);

	onMount(() => {
		stage = new Konva.Stage({
			container, x, y, width, height, visible, listening, id, name, opacity, scale, scaleX,
			scaleY, rotation, offset, offsetX, offsetY, draggable, dragDistance, dragBoundFunc
		});
		return () => {
			stage.destroy();
			stage = null;
		};
	});

</script>

<div bind:this={container}>
	{#if stage}
		<slot/>
	{/if}
</div>