<script lang="ts">
    import Konva from 'konva'
    import {createEventDispatcher, getContext, onMount} from "svelte";
    import context from "./context";
    import {EVENTS} from "./util";

    export let points:Array<number> = [];
    export let x: number = 0;
    export let y: number = 0;
    export let width: number = undefined;
    export let height: number = undefined;
    export let visible: boolean = true;
    export let listening: boolean = undefined;
    export let id: string = undefined;
    export let name: string = undefined;
    export let opacity: number = undefined;

    export let arrow:boolean = false;

    export let fill:string = 'black';

    export let stroke:string = 'black';

    export let strokeWidth:number = undefined;

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
    $: line && line.points(points);

</script>