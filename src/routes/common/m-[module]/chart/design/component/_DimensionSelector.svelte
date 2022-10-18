<script lang="ts">
    import {Icon,removeIcon,mouse} from "$lib/youi/index";

    import type {MeasureItem} from "$lib/component/cube/DataCube";
    import AggregateSelector from "$lib/component/cube/AggregateSelector.svelte";

    import {createEventDispatcher} from "svelte";

    const DIMENSION_CLASS_NAME = 'dimension-item';

    const dispatch = createEventDispatcher();

    export let measureItems:MeasureItem[] = [];

    export let rowDimensions = [];//维度

    let container:HTMLElement = undefined;

    const handle_dimension_drop = ({detail}) => {
        rowDimensions = rowDimensions.concat({...detail.drop, items: []});
        doChange();
    }

    const removeDimension = (index) => {
        rowDimensions.splice(index,1);
        rowDimensions = rowDimensions;
        doChange();
    }

    const handle_measure_drop = async ({detail}) => {
        let aggregate = detail.drop.dataType === 'i64' ? 'sum' : 'count';
        measureItems = measureItems.concat([{
            ...detail.drop,
            aggregate,
            id: detail.drop.name + '_' + aggregate
        } as MeasureItem]);
        doChange();
    }
    /**
     * 删除计量
     * @param index
     */
    const removeMeasureItem = async (index) => {
        measureItems.splice(index,1);
        measureItems = measureItems;
        doChange();
    }

    const doChange = () => {
        dispatch('change');
    }

    let dragElem = undefined;
    let dropElem = undefined;
    let startOffset = 0;

    /**
     *
     * @param e
     */
    const mouseStart = (e) => {
        dragElem = findItemByDom(e.target);
        if(dragElem){
            dragElem.classList.add('moving');
        }
    }

    /**
     *
     * @param e
     */
    const mouseDrag = (e) => {
        //
        if(dragElem){
            //
            dragElem.style.left = e.pageX+'px';
            dragElem.style.top = e.pageY+'px';
            let overElem = findItemByDom(e.target);
            if(overElem){
                if(dropElem && dropElem!=overElem){
                    dropElem.classList.remove('drop-left','drop-right');
                }

                let c = overElem.offsetLeft + overElem.offsetWidth/2 + 54;//54 = label width
                let p = e.pageX - container.offsetLeft;

                if(p>c){
                    overElem.classList.remove('drop-left');
                    overElem.classList.add('drop-right');
                }else{
                    overElem.classList.remove('drop-right');
                    overElem.classList.add('drop-left');
                }
                dropElem = overElem;
            }else{
                dropElem && dropElem.classList.remove('drop-left','drop-right');
            }
        }
    }

    /**
     *
     * @param e
     */
    const mouseStop = (e) => {
        if(dragElem){
            dragElem.classList.remove('moving');
        }
        if(dropElem){
            dropElem.classList.remove('drop-left','drop-right');
        }

        if(dragElem && dropElem){
            let dragContainerName = dragElem.parentNode.getAttribute('data-name');
            let dropContainerName = dropElem.parentNode.getAttribute('data-name');

            if(dragContainerName == dropContainerName){
                //
                let fromIndex = dragElem.getAttribute("data-index");
                let toIndex = +dropElem.getAttribute("data-index");

                if(dropElem.classList.contains('drop-left')){
                    toIndex--;
                }

                if(dropContainerName === 'measureItems'){
                    if(toIndex === measureItems.length-1){
                        measureItems.push(measureItems[fromIndex]);
                    }else{
                        measureItems.splice(toIndex,0,measureItems[fromIndex]);
                    }

                    //删除fromIndex
                    if(toIndex<fromIndex){
                        fromIndex++;
                    }
                    measureItems.splice(fromIndex,1);
                    measureItems = measureItems;
                    doChange();
                }

            }else{
                //

            }
        }

        dragElem = null;
        dropElem = null;
    }
    /**
     *
     * @param dom
     */
    const findItemByDom = (dom) => {
        if(!dom || !dom.className || !dom.className.startsWith){
            return null;
        }

        if(dom.className.startsWith(DIMENSION_CLASS_NAME)){
            return dom;
        }else if(dom.parentNode.className.startsWith(DIMENSION_CLASS_NAME)){
            return dom.parentNode;
        }
    }
</script>

<div use:mouse={{mouseStart,mouseDrag,mouseStop}} bind:this={container}>
    <div class="dimension-container flex">
        <span class="flex-label">维度</span>
        <div data-name="rowDimensions" class="dimension flex-1" on:drop={handle_dimension_drop}>
            {#each rowDimensions as dimension,index}
                <div on:dblclick={()=>{dispatch('dimension-editing',dimension)}} class={DIMENSION_CLASS_NAME} data-index={index}>
                    <span>{dimension.text}</span>
                    <span class="btn-remove" on:click={()=>removeDimension(index)}>
                        <Icon data={removeIcon}></Icon>
                    </span>
                </div>
            {/each}
        </div>
    </div>

    <div class="dimension-container flex">
        <span class="flex-label">指标</span>
        <div data-name="measureItems"  class="dimension flex-1" on:drop={handle_measure_drop}>
            {#each measureItems as measureItem,index}
                <div class={DIMENSION_CLASS_NAME} data-index={index}>
                    <AggregateSelector on:change={()=>{
                        measureItem.id = measureItem.name+'_'+measureItem.aggregate;
                        measureItems = measureItems;
                        doChange();
                    }} bind:aggregate={measureItem.aggregate} dataType={measureItem.dataType}/>
                    <span on:dblclick={()=>{dispatch('measure-editing',measureItem)}} > ：{measureItem.text}</span>
                    <span class="btn-remove" on:click={()=>removeMeasureItem(index)}>
                        <Icon data={removeIcon}></Icon>
                    </span>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .dimension-container {
        padding: 5px;
        background-color: white;
        border-radius: 6px;
        border: 1px dotted silver;
        margin: 5px;
        line-height: 30px;
    }

    .dimension {
        padding: 0px 5px;
        position: relative;
    }

    .dimension-item {
        border: 1px solid #dddddd;
        border-radius: 8px;
        padding: 0px 6px;
        display: flex;
        float: left;
        margin: 0px 5px;
    }

    .flex-label {
        line-height: 32px;
        padding-right: 5px;
    }
</style>
