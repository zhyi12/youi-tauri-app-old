<script lang="ts">

    import {writable} from "svelte/store";
    import {createEventDispatcher, setContext} from "svelte";
    import RecursiveList from "./RecursiveList.svelte";
    import {findTreeNode} from "../util/tree.util";

    let dispatch = createEventDispatcher();

    export let children = [];

    /**
     * item样式
     * @type {string}
     */
    export let itemClass = '';

    export let selectedId = undefined;

    let selectedNodeId = writable("");

    $: selectedNodeId.set(selectedId);

    setContext("ListTree", {
        selectedNodeId,
        selectNode: function (id) {
            if(selectedId != id){
                selectedId = id;
                let node = findTreeNode(children,id);
                dispatch('select',node);
            }
        }
    });

</script>

<RecursiveList class="youi-tree" {children} {itemClass}></RecursiveList>