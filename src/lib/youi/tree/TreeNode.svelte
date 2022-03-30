<script lang="ts">


    export let leaf = false;

    export let id = "";
    export let text = "";
    export let level = 0;
    export let icon = undefined;

    let ref = null;
    let refLabel = null;

    $: if (refLabel) {
        refLabel.style.marginLeft = `-${level+2}rem`;
        refLabel.style.paddingLeft = `${level+2}rem`;
    }
</script>

<li class="treeNode leaf level-{level}" bind:this="{ref}" id="{id}">
    <div bind:this="{refLabel}" class:tree-node-label="{true}">
        {#if icon}

        {/if}
        <span>{text}</span>
    </div>
</li>

<style>
    .treeNode{
        list-style: none;
    }
</style>