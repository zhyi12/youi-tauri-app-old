<script lang="ts">

	import Konva from 'konva';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import context from './context';

	export let cornerRadius: number;
	// cornerRadius	Number	<optional>
	export let fill: string = null;
	// fill	String	<optional> fill color
	//
	// fillPatternImage	Image	<optional>
	// fill pattern image
	//
	export let fillPatternX: number;
	// fillPatternX	Number	<optional>
	export let fillPatternY: number;
	// fillPatternY	Number	<optional>
	export let fillPatternOffset: any;
	// fillPatternOffset	Object	<optional>
	// object with x and y component
	//
	export let fillPatternOffsetX: number;
	// fillPatternOffsetX	Number	<optional>
	export let fillPatternOffsetY: number;
	// fillPatternOffsetY	Number	<optional>
	export let fillPatternScale: any;
	// fillPatternScale	Object	<optional>
	// object with x and y component
	export let fillPatternScaleX: number;
	// fillPatternScaleX	Number	<optional>
	export let fillPatternScaleY: number;
	// fillPatternScaleY	Number	<optional>
	export let fillPatternRotation: number;
	// fillPatternRotation	Number	<optional>
	export let fillPatternRepeat: string;
	// fillPatternRepeat	String	<optional>
	// can be "repeat", "repeat-x", "repeat-y", or "no-repeat". The default is "no-repeat"
	//
	export let fillLinearGradientStartPoint: any;
	// fillLinearGradientStartPoint	Object	<optional>
	// object with x and y component
	//
	export let fillLinearGradientStartPointX: number;
	// fillLinearGradientStartPointX	Number	<optional>
	export let fillLinearGradientStartPointY: number;
	// fillLinearGradientStartPointY	Number	<optional>
	export let fillLinearGradientEndPoint: any;
	// fillLinearGradientEndPoint	Object	<optional>
	// object with x and y component
	//
	export let fillLinearGradientEndPointX: number;
	// fillLinearGradientEndPointX	Number	<optional>
	export let fillLinearGradientEndPointY: number;
	// fillLinearGradientEndPointY	Number	<optional>
	export let fillLinearGradientColorStops = [];
	// fillLinearGradientColorStops	Array	<optional>
	// array of color stops
	//
	export let fillRadialGradientStartPoint: any;
	// fillRadialGradientStartPoint	Object	<optional>
	// object with x and y component
	//
	export let fillRadialGradientStartPointX: number;
	// fillRadialGradientStartPointX	Number	<optional>
	export let fillRadialGradientStartPointY: number;
	// fillRadialGradientStartPointY	Number	<optional>
	export let fillRadialGradientEndPoint: any;
	// fillRadialGradientEndPoint	Object	<optional>
	// object with x and y component
	//
	export let fillRadialGradientEndPointX: number;
	// fillRadialGradientEndPointX	Number	<optional>
	export let fillRadialGradientEndPointY: number;
	// fillRadialGradientEndPointY	Number	<optional>
	export let fillRadialGradientStartRadius: number;
	// fillRadialGradientStartRadius	Number	<optional>
	export let fillRadialGradientEndRadius: number;
	// fillRadialGradientEndRadius	Number	<optional>
	export let fillRadialGradientColorStops = [];
	// fillRadialGradientColorStops	Array	<optional>
	// array of color stops
	//
	export let fillEnabled = true;
	// fillEnabled	Boolean	<optional>
	// flag which enables or disables the fill. The default value is true
	//
	export let fillPriority:string;
	// fillPriority	String	<optional>
	// can be color, linear-gradient, radial-graident, or pattern. The default value is color. The fillPriority property makes it really easy to toggle between different fill types. For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
	//
	export let stroke = 'black';
	// stroke	String	<optional>
	// stroke color
	//
	export let strokeWidth:number;
	// strokeWidth	Number	<optional>
	// stroke width
	export let fillAfterStrokeEnabled = false;
	// fillAfterStrokeEnabled	Boolean	<optional>
	// Should we draw fill AFTER stroke? Default is false.
	//
	export let hitStrokeWidth:number;
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
	export let lineJoin = 'miter';
	// lineJoin	String	<optional>
	// can be miter, round, or bevel. The default is miter
	export let lineCap = 'butt';
	// lineCap	String	<optional>
	// can be butt, round, or square. The default is butt
	export let shadowColor:string;
	// shadowColor	String	<optional>
	export let shadowBlur: number;
	// shadowBlur	Number	<optional>
	export let shadowOffset: any;
	// shadowOffset	Object	<optional>
	// object with x and y component
	export let shadowOffsetX: number;
	// shadowOffsetX	Number	<optional>
	export let shadowOffsetY: number;
	// shadowOffsetY	Number	<optional>
	export let shadowOpacity: number;
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

	let rect :Konva.Rect;


	onMount(()=>{
		const options = {
			cornerRadius,fill,fillPatternX,fillPatternY,fillPatternOffset,fillPatternOffsetX,
			fillPatternOffsetY,fillPatternScale,fillPatternScaleX,fillPatternScaleY,fillPatternRotation,
			fillPatternRepeat,fillLinearGradientStartPoint,fillLinearGradientStartPointX,fillLinearGradientStartPointY,
			fillLinearGradientEndPoint,fillLinearGradientEndPointX,fillLinearGradientEndPointY,fillLinearGradientColorStops,
			fillRadialGradientStartPoint,fillRadialGradientStartPointX,fillRadialGradientStartPointY,fillRadialGradientEndPoint,
			fillRadialGradientEndPointX,fillRadialGradientEndPointY,fillRadialGradientStartRadius,fillRadialGradientEndRadius,
			fillRadialGradientColorStops,fillEnabled,fillPriority,stroke,strokeWidth,fillAfterStrokeEnabled,hitStrokeWidth,
			strokeHitEnabled,perfectDrawEnabled,shadowForStrokeEnabled,strokeScaleEnabled,strokeEnabled,lineJoin,lineCap,
			shadowColor,shadowBlur,shadowOffset,shadowOffsetX,shadowOffsetY,shadowOpacity,shadowEnabled,dash,dashEnabled,
			x,y,width,height,visible,listening,id,name,opacity,scale,scaleX,scaleY,rotation,offset,offsetX,offsetY,draggable,dragDistance,dragBoundFunc

		};

		rect = new Konva.Rect({x,y,width,height,fill,stroke,strokeWidth});

		const to = parent();
		to.add(rect);
		dispatch('added', { rect, to })

		return () => {
			rect.destroy();
			rect = null;
		};
	});

	$: rect && rect.x(x);
	$: rect && rect.y(y);
	$: rect && rect.width(width);
	$: rect && rect.height(height);

</script>