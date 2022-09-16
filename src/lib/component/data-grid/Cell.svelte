<script lang="ts">
    import {Group, Rect,Text} from "../../thirdpart/konva";

    export let x = 0;
    export let y = 0;

    export let width:number = null;
    export let height:number = null;

    export let fill = 'white';
    export let strokeWidth = 1;
    export let stroke = "#d9d9d9";
    export let text = '';

</script>

<Group {...{x,y,width,height}}>
    <Rect {...{x:0,y:0,width,height,fill,strokeWidth,stroke}}>
    </Rect>
    <Text
            x={0}
            y={0}
            height={height}
            width={width}
            text={text}
            hitStrokeWidth={0}
            verticalAlign="middle"
            wrap={"none"} ellipsis={true}
    />
</Group>