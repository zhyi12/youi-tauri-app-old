<script lang="ts">
    import {ListTree,Toolbar,Button,Icon} from "$lib/youi/index";
    import {backIcon} from "$lib/app-icon";
    import Flow from "$lib/component/flow/Flow.svelte";

    export let data;
</script>

<div class="page-left">
    <Toolbar>
        <Button title="返回" href={`/${data.module}/model/${data.folder||'top'}`}>
            <Icon data={backIcon}></Icon>
        </Button>
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
