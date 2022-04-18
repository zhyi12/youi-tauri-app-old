<script lang="ts">
	import Group from '../konva/Group.svelte';
	import Rect from '../konva/Rect.svelte';
	import Text from '../konva/Text.svelte';

	export let x = 0;
	export let y = 0;

	export let width:number = null;
	export let height:number = null;
	export let fill = 'white';
	export let strokeWidth = 1;
	export let stroke = "#d9d9d9";

	export let style = {};

	export let text = '';

	export let rowIndex:number = null;
	export let columnIndex:number = null;
	export let key:string = null;
	export let isMergedCell:boolean = null;

</script>

<Group>
	<Rect {...{x:x+0.5,y:y+0.5,width,height,fill,strokeWidth,stroke}}>

	</Rect>
	<slot>
		<Text
			x={x+0.5}
			y={y+0.5}
			height={height}
			width={width}
			text={text}
			hitStrokeWidth={0}
			textAlign='center'
		/>
	</slot>
</Group>

