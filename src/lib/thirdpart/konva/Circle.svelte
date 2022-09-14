<script lang="ts">
    import Konva from 'konva'
    import {createEventDispatcher, getContext, onMount} from "svelte";
    import context from "./context";

    export let points:Array<number> = [];
    export let x = 0;
    export let y = 0;
    export let width: number = undefined;
    export let height: number = undefined;
    export let visible = true;
    export let listening: boolean = undefined;
    export let id: string = undefined;
    export let name: string = undefined;
    export let opacity: number = undefined;

    export let radius: number = undefined;

    export let draggable = false;

    export let fill = 'black';

    export let stroke = 'black';

    export let strokeWidth:number = undefined;

    let circle :Konva.Circle;
    const dispatch = createEventDispatcher();
    const parent: () => Konva.Container = getContext(context.parent);

    onMount(()=>{
        circle = new Konva.Circle({
            x,y,width,height,visible,listening,id,name,opacity,
            fill,
            points,
            stroke,strokeWidth,radius,draggable
        });

        const to = parent();
        to.add(circle);
        dispatch('added', { circle, to });

        circle.on('dragmove', function (e) {
            dispatch('dragmove',{container:to,target:e.target});
        });

        return () => {
            circle.destroy();
            circle = undefined;
        };
    });
</script>