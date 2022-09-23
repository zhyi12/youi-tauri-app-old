<script lang="ts">

    import classnames from "../util/utils";
    import {getContext} from "svelte";
    import {FIELD_CONTAINER_CONTEXT} from "./helper";

    let className = '';
    export { className as class };
    export let property:string = undefined;
    export let value:string = undefined;
    export let text:string = undefined;

    $: classes = classnames(className,'youi-field fieldLabel');

    let context = getContext(FIELD_CONTAINER_CONTEXT);

    if(context){
        context.addField({
            property: property,
            getValue: () => {
                return value;
            }
        })
    }

</script>

<div class={classes}>
    <span class="form-control">{text||value}</span>
</div>

<style>
    .form-control{
        background-color: #f9f9f9;
    }
</style>