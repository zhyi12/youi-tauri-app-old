<script lang="ts">
    import {findClosestTag} from '../util/dom.util';
    import TreeNodeList from "./TreeNodeList.svelte";
    import {mouse} from "../mouse/mouse";
    import classnames from "../util/utils";

    let className = '';

    export { className as class };

    export let children = [];
    export let draggable = false;
    export let dragStyles = ['treeNode'];

    let refDraggingHelper = null;
    let dragId = null;
    let dragging = false;
    let dragContent = {html:''};


    $: classes = classnames("youi-tree",className);

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

<div class={classes} use:mouse={draggable?{mouseStart,mouseDrag,mouseStop}:null}>
    <ul role="tree"
        {...$$restProps}>

        <TreeNodeList root="true" children="{children}" level="0">

        </TreeNodeList>
    </ul>
    {#if draggable&&dragging}
    <ul class="tree-dragging-helper" bind:this="{refDraggingHelper}">
        {@html dragContent.html}
    </ul>
    {/if}
</div>