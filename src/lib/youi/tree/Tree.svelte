<script lang="ts">
    import {findClosestTag} from '../util/dom';
    import TreeNodeList from "./TreeNodeList.svelte";
    import {mouse} from "../mouse/mouse";
    import classnames, {toPixel} from "../util/utils";
    import {createEventDispatcher, onMount, setContext} from "svelte";
    import {writable} from "svelte/store";
    import {findTreeNode} from "../util/tree.util";

    let className = '';

    export { className as class };

    export let children = [];
    export let draggable = false;
    export let width:number = undefined;

    export let load = async (id,level)=>[];

    /**
     * Set the current active node id
     * Only one node can be active
     * @type {TreeNodeId}
     */
    export let activeId = "";

    /**
     * Set the node ids to be selected
     * @type {TreeNodeId[]}
     */
    export let selectedIds = [];

    /**
     * Set the node ids to be expanded
     * @type {TreeNodeId[]}
     */
    export let expandedIds = [];

    let refDraggingHelper = null;
    let dragId = null;
    let dragging = false;
    let dragContent = {html:''};

    const dispatch = createEventDispatcher();
    const activeNodeId = writable(activeId);
    const selectedNodeIds = writable(selectedIds);
    const expandedNodeIds = writable(expandedIds);

    setContext("Tree", {
        activeNodeId,
        selectedNodeIds,
        expandedNodeIds,
        clickNode: (node) => {
            activeId = node.id;
            selectedIds = [node.id];
            dispatch("select", node);
        },
        selectNode: (node) => {
            selectedIds = [node.id];
        },
        expandNode: async (node, expanded,id,level) => {
            if(expanded && node.loaded==false){
                //加载数据
                const result = await load(id,level);
                let node = findTreeNode(children,id);
                if(result && node){
                    if(result.length){
                        Object.assign(node,{
                            children:result,
                            loaded:true,
                            expanded:true
                        });
                    }else{
                        Object.assign(node,{
                            leaf:true,
                            loaded:true,
                            expanded:true
                        });
                    }
                    expandedIds = [...expandedIds, id];
                    return result;
                }
            }

            if (expanded) {
                expandedIds = [...expandedIds, node.id];
            } else {
                expandedIds = expandedIds.filter((_id) => _id !== node.id);
            }
        },
        focusNode: (node) => dispatch("focus", node),
        toggleNode: (node) => {
            if(node.expanded){
                expandedIds.push(node.id);
            }else{
                expandedIds = expandedIds.filter(expandedId=>expandedId!=node.id);
            }
            dispatch("toggle", node);
        },
    });

    $: classes = classnames("youi-tree",className);

    // $: nodeIds = nodes.map((node) => node.id);
    $: activeNodeId.set(activeId);
    $: selectedNodeIds.set(selectedIds);
    $: expandedNodeIds.set(expandedIds);

    /**
     * 鼠标拖动开始
     * @param event
     */
    function mouseStart(event){
        let nodeDom = findClosestTag(event.target,'li');
        if(nodeDom){
            dragId = nodeDom.getAttribute('id');
            dragging = true;
            dragContent = {html:'<li>'+nodeDom.innerHTML+'</li>'};
        }
        return true;
    }
    /**
     * 鼠标拖动中
     * @param event
     */
    function mouseDrag(event){
        _calDraggingPos(event);
    }
    /**
     * 鼠标拖动结束
     * @param event
     * @param
     */
    function mouseStop(event){
        //
        let dragItem = {};
        if(dragId){
            dragItem = _findNodeItem(dragId);
        }

        dragId = null;
        dragging = false;
        dragContent = {html:''};
        return dragItem;
    }

    function _calDraggingPos(event){
        if(refDraggingHelper){
            refDraggingHelper.style.top = `${event.pageY+5}px`;
            refDraggingHelper.style.left = `${event.pageX+5}px`;
        }
    }

    /**
     *
     * @param id
     */
    function _findNodeItem(id){
        return _findItem(children,id);
    }

    /**
     *
     * @param items
     * @param id
     */
    function _findItem(items,id){
        for(let i=0;i<items.length;i++){
            let item = items[i];
            if(item.id == id){
                return item;
            }else if(Array.isArray(item.children)){
                item = _findItem(item.children,id);
                if(item){
                    return item;
                }
            }
        }
        return null;
    }

</script>

<div class={classes}
     style:width={width?toPixel(width):''}
     use:mouse={draggable?{mouseStart,mouseDrag,mouseStop}:null}>
    <ul role="tree"
        {...$$restProps}>

        <TreeNodeList root={true} children="{children}" level="0">

        </TreeNodeList>
    </ul>
    {#if draggable&&dragging}
    <ul class="tree-dragging-helper" bind:this="{refDraggingHelper}">
        {@html dragContent.html}
    </ul>
    {/if}
</div>
