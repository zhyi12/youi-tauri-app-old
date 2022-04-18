<script lang="ts" >

    import ListBoxMenuItem from "../list-box/ListBoxMenuItem.svelte";
    import ListBoxMenu from "../list-box/ListBoxMenu.svelte";
    import Icon from "../icon/Icon.svelte";
    import icon_check from '../icons/square-o';
    import icon_checked from '../icons/check-square-o';
    import icon_close from '../icons/close';
    import {afterUpdate, createEventDispatcher} from "svelte";

    export let items = [];

    export let selectedIds = [];

    export let check = true;

    export let draggable = false;
    export let draggingItem = null;

    export let droppable = false;

    export let removable = false;

    export let height:number = null;

    /** Set an id for the list box component */
    export let id = "ccs-" + Math.random().toString(36);

    const dispatch = createEventDispatcher();

    let prevChecked = [];

    $: ariaLabel = $$props["aria-label"] || "Choose an item";

    $: sortedItems = items.map((item) => ({
        ...item,
        checked: selectedIds.includes(item.id),
    }));

    $: checked = sortedItems.filter(({ checked }) => checked);
    $: unchecked = sortedItems.filter(({ checked }) => !checked);

    /**
     *
     */
    afterUpdate(()=>{
        if (checked.length !== prevChecked.length) {
            selectedIds = checked.map(({ id }) => id);
            prevChecked = checked;

            dispatch("select", {
                selectedIds,
                selected: checked,
                unselected: unchecked,
            });
        }
    });

    /**
     *
     * @param e
     */
    const handle_item_drag = (e)=>{
        draggingItem = {
            ... sortedItems[e.detail.index]
        };
    }

    /**
     *
     * @param e
     */
    const handle_drag_stop = (e) => {
        var event = new CustomEvent("drop", {
            detail: {
                drop:{...draggingItem}
            }
        });
        e.detail.target.dispatchEvent(event);
    }

</script>

<ListBoxMenu aria-label="{ariaLabel}" id="{id}" {draggable} {droppable} {height}
             on:dragStart={handle_item_drag}
             on:dragStop={handle_drag_stop}
             on:drop
             {draggingItem}>
    {#each  sortedItems as item, i (item.id)}
        <ListBoxMenuItem
                id="{item.id}"
                active="{item.checked}"
                on:click={()=>{
                    item.checked=!item.checked;
                    dispatch('check',item);
                }}
        >
            <Icon data={item.checked==false?icon_check:icon_checked}></Icon>
            <span class:item-text={true} class:active={item.checked}>{item.text}</span>
            {#if removable}
                <span on:click|stopPropagation={(e)=>{
                    items = items.filter(({id})=>id!=item.id);}} >
                    <Icon data={icon_close}></Icon>
               </span>
            {/if}
        </ListBoxMenuItem>
    {/each}
</ListBoxMenu>

<style>
    .item-text{
        padding-left: 2px;
    }

    .item-text.active{
        padding-left: 0px;
    }
</style>