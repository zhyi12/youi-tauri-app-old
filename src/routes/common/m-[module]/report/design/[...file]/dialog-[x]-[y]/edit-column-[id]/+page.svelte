<script lang="ts">

    import {getContext} from "svelte";
    import {page} from "$app/stores";

    import {CONTEXT} from "../../helper";
    import {FormItem,FieldInput} from "$lib/youi/index";

    const {store,update} = getContext(CONTEXT);

    let column = $store.columns.filter(column=>column.id == $page.params.id)[0];

    /**
     *
     */
    const handle_change = () => {
        //更新模型数据
        update();
    }

</script>

{#if column}
    <div class="page">
        <FormItem>
            <FieldInput on:change={handle_change}
                        on:keydown={(e)=>{
                            if(e.keyCode === 13){
                                handle_change(e);
                            }
                        }}
                        bind:value={column.text}></FieldInput>
        </FormItem>
    </div>
{/if}

<style>
    .page{
        color: black;
    }
</style>
