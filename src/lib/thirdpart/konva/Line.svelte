<script lang="ts">
    import Konva from 'konva'
    import {createEventDispatcher, getContext, onMount} from "svelte";
    import context from "./context";
    import {EVENTS} from "./util";

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

    export let arrow = false;

    export let fill = 'black';

    export let stroke = 'black';

    export let strokeWidth = 1;

    let line :Konva.Line;
    const dispatch = createEventDispatcher();
    const parent: () => Konva.Container = getContext(context.parent);

    onMount(()=>{
        let config = {id,name,
            x,y,width,height,visible,listening,opacity,
            fill,
            points,
            stroke,strokeWidth
        };
        if(arrow){
            line = new Konva.Arrow(config);
        }else{
            line = new Konva.Line(config);
        }

        const to = parent();
        to.add(line);
        dispatch('added', { line, to });

        EVENTS.forEach((eventName)=>{
            line.on(eventName, function (e) {
                dispatch(eventName,{container:to,target:e.target});
            });
        });

        return () => {
            line.destroy();
            line = undefined;
        };
    });

    $: line && line.id(id);
    $: line && line.x(x);
    $: line && line.y(y);
    $: line && line.width(width);
    $: line && line.height(height);
    $: line && line.strokeWidth(strokeWidth);
    $: line && line.fill(fill);
    $: line && line.points(points);

</script>