<script lang="ts">

    import {getContext} from "svelte";
    import {CONTEXT, DIALOG_EDIT_COLUMN, DIALOG_EDIT_COLUMN_TITLE} from "../[...file]/helper";
    import {List} from "$lib/youi/index";

    const {store,openDialog} = getContext(CONTEXT);

    const openColumnEditor = ({pageY},column) => {
        openDialog(`${DIALOG_EDIT_COLUMN}-${column.id}`,{
            x:container.offsetLeft+300,
            y:pageY,
            title:DIALOG_EDIT_COLUMN_TITLE
        });
    }

    let container:HTMLElement = undefined;

</script>

<div class="page-left" bind:this={container}>
    <List items={$store.columns} check={false}
          on:dblclick={({detail})=>{openColumnEditor(detail.evt,detail.item)}}
          draggable={true}>
    </List>
</div>

<style lang="scss">
    .page-left{
      width: 200px;
      border-right: 1px solid silver;


    }
</style>