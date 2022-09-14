<script lang="ts">

    import Konva from 'konva'
    import {createEventDispatcher, getContext, onMount} from "svelte";
    import context from "./context";
    import {EVENTS} from "./util";

    export let id:string  = undefined;
    export let x:number = undefined;
    export let y:number = undefined;
    export let data:string = undefined;

    export let stroke:string = "#000000";
    export let lineJoin:string = "miter";
    export let lineCap:string = "butt";
    export let strokeWidth:number = 0.5;

    export let fill:string = undefined;

    let path :Konva.Path;
    const dispatch = createEventDispatcher();
    const parent: () => Konva.Container = getContext(context.parent);

    onMount(()=>{
        path = new Konva.Path({
            id,x,y,data,stroke,strokeWidth,fill
        });

        const to = parent();
        to.add(path);

        EVENTS.forEach((eventName)=>{
            path.on(eventName, function (e) {
                dispatch(eventName,{container:to,target:e.target,evt:e.evt});
            });
        });

        return () => {
            path.destroy();
            path = undefined;
        };
    });

    $: path && path.stroke(stroke);
    $: path && path.fill(fill);
</script>