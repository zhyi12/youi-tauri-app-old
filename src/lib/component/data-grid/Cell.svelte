<script lang="ts">
    import {Group, Rect, Text} from "../../thirdpart/konva";

    export let x = 0;
    export let y = 0;

    export let width: number = null;
    export let height: number = null;

    export let fill = 'white';
    export let strokeWidth = 1;
    export let stroke = "#d9d9d9";
    export let color = 'black';
    export let padding = 0;
    export let text = '';
    export let align = '';
    export let verticalAlign = 'middle';
    export let fontSize = 14;
    export let fontStyle: string = undefined;

    export let draw = true;

    export let data: Record<any, any> = undefined;//额外数据

</script>
{#if draw}
    <Group {...{x, y, width, height}}>
        {#if fill && stroke}
            <Rect {...{x: 0, y: 0, width, height, fill, strokeWidth, stroke}}>
            </Rect>
        {/if}
        <Text
                x={0}
                y={0}
                height={height}
                width={width}
                {padding}
                text={text}
                {align}
                {verticalAlign}
                {fontSize}
                {fontStyle}
                fill={color}
                wrap={"none"} ellipsis={true}
        />
        <slot>

        </slot>
    </Group>
{/if}