<script lang="ts">
    import {ListTree,Toolbar} from "$lib/youi/index";
    import Flow from "$lib/component/flow/Flow.svelte"
    export let data;
</script>

<div class="page-left">
    <Toolbar>
        <a href={`/${data.module}/model/${data.folder||'top'}`}>返回</a>
    </Toolbar>
    <ListTree children={data.model.children}></ListTree>
</div>

<div class="content flex-full flex-column">
    <div class="flex-1 flex-full content">
        <Toolbar>

        </Toolbar>
        <Flow class="flex-full" nodes={data.nodes} transitions={data.transitions}>

        </Flow>
    </div>
    {#if data.tableId}
        <div style="height:300px;">
            <slot>

            </slot>
        </div>
    {/if}
</div>


<style>
    .page-left{
        width:200px;
    }
</style>
