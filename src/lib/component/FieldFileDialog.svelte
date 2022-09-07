<script lang="ts">
    import {Button,classnames,Input} from "../youi";
    import {open} from "../tauri/dialog";
    import {createEventDispatcher} from "svelte";

    let className = '';
    export { className as class };

    /**
     * field 属性名
     */
    export let property:string = undefined;
    /**
     * 值
     */
    export let value:string | string[];

    export let caption = '选择文件';

    export let extensions:string[] = [''];

    export let readonly = false;

    export let placeholder:string = undefined;

    let dispatcher = createEventDispatcher();

    $: classes = classnames(className,readonly?'readonly':'','youi-field input-group fieldFieldDialog');
    /**
     * 文件选择
     */
    const openDialog = async () => {
        const selected = await open({
            filters: [{
                name: property,
                extensions: extensions
            }]
        })
        if (selected === null){
            //取消选择
        }else {
            value = selected;
            dispatcher('change',{value});
        }
    }

</script>

<div data-property={property} class={classes} title={value} on:click={()=>!readonly && openDialog()}>
    {#if caption}
        <Button>
            {caption}
        </Button>
    {/if}
    <Input value={value} readonly="true" {placeholder}/>
</div>