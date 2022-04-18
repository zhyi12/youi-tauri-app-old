<script lang="ts">

	import Konva from 'konva';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import context from './context';

	export let cornerRadius: number = undefined;
	// cornerRadius	Number	<optional>
	export let fill: string = undefined;
	// fill	String	<optional> fill color
	//
	// fillPatternImage	Image	<optional>
	// fill pattern image
	//
	export let fillPatternX: number = undefined;
	// fillPatternX	Number	<optional>
	export let fillPatternY: number = undefined;
	// fillPatternY	Number	<optional>
	export let fillPatternOffset: any = undefined;
	// fillPatternOffset	Object	<optional>
	// object with x and y component
	//
	export let fillPatternOffsetX: number = undefined;
	// fillPatternOffsetX	Number	<optional>
	export let fillPatternOffsetY: number = undefined;
	// fillPatternOffsetY	Number	<optional>
	export let fillPatternScale: any = undefined;
	// fillPatternScale	Object	<optional>
	// object with x and y component
	export let fillPatternScaleX: number = undefined;
	// fillPatternScaleX	Number	<optional>
	export let fillPatternScaleY: number = undefined;
	// fillPatternScaleY	Number	<optional>
	export let fillPatternRotation: number = undefined;
	// fillPatternRotation	Number	<optional>
	export let fillPatternRepeat: string = undefined;
	// fillPatternRepeat	String	<optional>
	// can be "repeat", "repeat-x", "repeat-y", or "no-repeat". The default is "no-repeat"
	//
	export let fillLinearGradientStartPoint: any = undefined;
	// fillLinearGradientStartPoint	Object	<optional>
	// object with x and y component
	//
	export let fillLinearGradientStartPointX: number = undefined;
	// fillLinearGradientStartPointX	Number	<optional>
	export let fillLinearGradientStartPointY: number = undefined;
	// fillLinearGradientStartPointY	Number	<optional>
	export let fillLinearGradientEndPoint: any = undefined;
	// fillLinearGradientEndPoint	Object	<optional>
	// object with x and y component
	//
	export let fillLinearGradientEndPointX: number = undefined;
	// fillLinearGradientEndPointX	Number	<optional>
	export let fillLinearGradientEndPointY: number = undefined;
	// fillLinearGradientEndPointY	Number	<optional>
	export let fillLinearGradientColorStops = [];
	// fillLinearGradientColorStops	Array	<optional>
	// array of color stops
	//
	export let fillRadialGradientStartPoint: any = undefined;
	// fillRadialGradientStartPoint	Object	<optional>
	// object with x and y component
	//
	export let fillRadialGradientStartPointX: number = undefined;
	// fillRadialGradientStartPointX	Number	<optional>
	export let fillRadialGradientStartPointY: number = undefined;
	// fillRadialGradientStartPointY	Number	<optional>
	export let fillRadialGradientEndPoint: any = undefined;
	// fillRadialGradientEndPoint	Object	<optional>
	// object with x and y component
	//
	export let fillRadialGradientEndPointX: number = undefined;
	// fillRadialGradientEndPointX	Number	<optional>
	export let fillRadialGradientEndPointY: number = undefined;
	// fillRadialGradientEndPointY	Number	<optional>
	export let fillRadialGradientStartRadius: number = undefined;
	// fillRadialGradientStartRadius	Number	<optional>
	export let fillRadialGradientEndRadius: number = undefined;
	// fillRadialGradientEndRadius	Number	<optional>
	export let fillRadialGradientColorStops = [];
	// fillRadialGradientColorStops	Array	<optional>
	// array of color stops
	//
	export let fillEnabled = true;
	// fillEnabled	Boolean	<optional>
	// flag which enables or disables the fill. The default value is true
	//
	export let fillPriority:string = undefined;
	// fillPriority	String	<optional>
	// can be color, linear-gradient, radial-graident, or pattern. The default value is color. The fillPriority property makes it really easy to toggle between different fill types. For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
	//
	export let stroke = 'black';
	// stroke	String	<optional>
	// stroke color
	//
	export let strokeWidth:number = undefined;
	// strokeWidth	Number	<optional>
	// stroke width
	export let fillAfterStrokeEnabled = false;
	// fillAfterStrokeEnabled	Boolean	<optional>
	// Should we draw fill AFTER stroke? Default is false.
	//
	export let hitStrokeWidth:number = undefined;
	// 	hitStrokeWidth	Number	<optional>
	// size of the stroke on hit canvas. The default is "auto" - equals to strokeWidth
	//
	export let strokeHitEnabled = true;
	// strokeHitEnabled	Boolean	<optional>
	// flag which enables or disables stroke hit region. The default is true
	export let perfectDrawEnabled = true;
	// perfectDrawEnabled	Boolean	<optional>
	// flag which enables or disables using buffer canvas. The default is true
	export let shadowForStrokeEnabled = true;
	// shadowForStrokeEnabled	Boolean	<optional>
	// flag which enables or disables shadow for stroke. The default is true
	export let strokeScaleEnabled = true;
	// strokeScaleEnabled	Boolean	<optional>
	// flag which enables or disables stroke scale. The default is true
	export let strokeEnabled = true;
	// strokeEnabled	Boolean	<optional>
	// flag which enables or disables the stroke. The default value is true
	export let shadowColor:string = undefined;
	// shadowColor	String	<optional>
	export let shadowBlur: number = undefined;
	// shadowBlur	Number	<optional>
	export let shadowOffset: any = undefined;
	// shadowOffset	Object	<optional>
	// object with x and y component
	export let shadowOffsetX: number = undefined;
	// shadowOffsetX	Number	<optional>
	export let shadowOffsetY: number = undefined;
	// shadowOffsetY	Number	<optional>
	export let shadowOpacity: number = undefined;
	// shadowOpacity	Number	<optional>
	// shadow opacity. Can be any real number
	// between 0 and 1
	export let shadowEnabled = true;
	// shadowEnabled	Boolean	<optional>
	// flag which enables or disables the shadow. The default value is true
	export let dash = [];
	// dash	Array	<optional>
	export let dashEnabled = true;
	// dashEnabled	Boolean	<optional>
	// flag which enables or disables the dashArray. The default value is true
	//
	export let x: number = 0;
	export let y: number = 0;
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
	export let dragBoundFunc: (pos: Konva.Vector2d) => Konva.Vector2d = undefined;

	const dispatch = createEventDispatcher();
	const parent: () => Konva.Container = getContext(context.parent);

	let rect :Konva.Rect;

	onMount(()=>{

		rect = new Konva.Rect({cornerRadius,fill,fillPatternX,fillPatternY,fillPatternOffset,fillPatternOffsetX,
            fillPatternOffsetY,fillPatternScale,fillPatternScaleX,fillPatternScaleY,fillPatternRotation,
            fillPatternRepeat,fillLinearGradientStartPoint,fillLinearGradientStartPointX,fillLinearGradientStartPointY,
            fillLinearGradientEndPoint,fillLinearGradientEndPointX,fillLinearGradientEndPointY,fillLinearGradientColorStops,
            fillRadialGradientStartPoint,fillRadialGradientStartPointX,fillRadialGradientStartPointY,fillRadialGradientEndPoint,
            fillRadialGradientEndPointX,fillRadialGradientEndPointY,fillRadialGradientStartRadius,fillRadialGradientEndRadius,
            fillRadialGradientColorStops,fillEnabled,fillPriority,stroke,strokeWidth,fillAfterStrokeEnabled,hitStrokeWidth,
            strokeHitEnabled,perfectDrawEnabled, shadowForStrokeEnabled,strokeScaleEnabled, strokeEnabled,
            shadowColor,shadowBlur,shadowOffset,shadowOffsetX,shadowOffsetY,shadowOpacity,shadowEnabled,dash,dashEnabled,
            x,y,width,height,visible,listening,id,name,opacity,scale,scaleX,scaleY,rotation,offset,offsetX,offsetY,draggable,dragDistance,dragBoundFunc});

		const to = parent();
		to.add(rect);
		dispatch('added', { rect, to });

		return () => {
			rect.destroy();
			rect = undefined;
		};
	});

	$: rect && rect.x(x);
	$: rect && rect.y(y);
	$: rect && rect.width(width);
	$: rect && rect.height(height);
	$: rect && rect.fill(fill);

</script>