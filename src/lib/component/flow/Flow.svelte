<script  lang="ts">
    import {Stage, Layer, Line, Rect, Group, Text} from "../../thirdpart/konva";
    import {Icon, plusIcon, trashIcon, listIcon, uuid,toPixel}
        from "../../youi";
    import Konva from "konva";
    import type {FlowNode,Point,Transition} from "./Flow.d.ts";
    import {is_function} from "svelte/internal";
    import {createEventDispatcher} from "svelte";

    export let height:number = undefined;
    export let nodes:FlowNode[] = [];
    export let transitions:Transition[] = [];
    export let overPanels = [
        {name:"addRefNode",text:"新节点",action:"",icon:plusIcon},
        {name:"property",text:"属性",action:"",icon:listIcon},
        {name:"removeRefNode",text:"删除",action:"",icon:trashIcon},
        {name:"removeNode2",text:"删除",action:""},
    ];

    let refContainer:HTMLElement = null;
    let dispatch = createEventDispatcher();

    let stroke = "#333ea9";
    let activeNodeId:string = null;
    let activeResizeNodeId:string = null;
    let selectedIds:string[] = [];

    let overPanelTop = 0;
    let overPanelRight = 0;
    let showOverPanel = false;
    let overGroupElem = null;
    let overNodeId = undefined;

    $: topOverPanels = overPanels.filter((panel,index)=>index<3).reverse();
    $: rightOverPanels = overPanels.filter((panel,index)=>index>=3);

    $: nodeMap = nodes.reduce((map, current) => {
        map[current.id] = current;
        return map;
    }, {});

    $: lines = transitions.map(transition=>{
        let points = [];
        let fromNode = nodeMap[transition.from];
        let toNode = nodeMap[transition.to];
        points = points.concat(getConnectorPoints(fromNode,toNode));
        return {id:transition.id,points};
    });

    function clearNodeResizeActive(elem){
        if(tr){
            tr.remove();
        }
    }

    /**
     *
     * @param rect
     * @param e
     */
    const activeFlowNode = (node,e) =>{
        let layer = e.detail.currentTarget.parent;
        if(activeResizeNodeId){
            clearNodeResizeActive(layer.findOne('#'+activeResizeNodeId));
        }
        _activeElement(layer,node.id);
    }

    const _activeElement = (layer,id)=>{
        if(selectedIds.length){
            selectedIds.forEach(id=>{
                let elem = layer.findOne('#'+id);
                elem && elem.stroke(stroke);
            })
        }
        selectedIds = [id];
        //
        activeNodeId = id;
        let elem = layer.findOne('#'+activeNodeId);
        elem && elem.stroke('red');
    }

    let tr:Konva.Transformer = null;

    const nodeGroupEnter = (node,e) => {
        overGroupElem = e.detail.currentTarget;
        overNodeId = node.id;

        overPanelTop = overGroupElem.y() - 28;
        overPanelRight = refContainer.offsetWidth - overGroupElem.x()-overGroupElem.width()-30;
        showOverPanel = true;
    }

    const nodeGroupLeave = (node,e) => {
        //
    }
    /**
     *
     * @param node
     * @param e
     */
    const activeNodeGroupResize = (node,e) => {
        let layer = e.detail.currentTarget.parent;
        let flowNode = nodeMap[node.id];

        if(activeResizeNodeId){
            clearNodeResizeActive(layer.findOne('#'+activeResizeNodeId));
        }

        activeResizeNodeId = node.id;

        let rectResizeElem = layer.findOne('#resize_' + node.id);
        let rectElem = layer.findOne('#' + node.id);

        rectResizeElem.x(rectElem.x());
        rectResizeElem.y(rectElem.y());

        tr = new Konva.Transformer({
            rotateEnabled:false,
            keepRatio:false,
            ignoreStroke: true,
        });

        tr.on('transform', function (e) {
            let width = rectResizeElem.width() * rectResizeElem.scaleX();
            let height = rectResizeElem.height() * rectResizeElem.scaleY();

            rectElem.height(height);
            rectResizeElem.parent.children
                .filter(elem=>elem.attrs.id!=='resize_'+node.id)
                .forEach(elem=>{
                    elem.width(width);
                    if(elem.name() == 'attrs'){
                        let rows = elem.find('.attr-row');
                        rows.forEach(row=>{
                            row.width(width);
                            row.clip({x:0,y:21,width:width,height:height});
                        });
                    }
                });

        });

        tr.on('transformend',function(e){
            flowNode.width = rectElem.width();
            flowNode.height = rectElem.height();

            refreshRefLines(layer,flowNode.id,flowNode);
            rectResizeElem.scaleX(1);
            rectResizeElem.scaleY(1);
            rectResizeElem.width(flowNode.width);
            rectResizeElem.height(flowNode.height);

            rectResizeElem.parent.width(flowNode.width);
            rectResizeElem.parent.height(flowNode.height);

            rectResizeElem.x(rectElem.x());
            rectResizeElem.y(rectElem.y());
        });

        layer.add(tr);
        tr.nodes([rectResizeElem]);
    }

    const nodeGroupMoving = (rect,e) => {
        let layer = e.detail.target.parent;
        let movingNodeMap = {};
        let movedPosition = e.detail.target.position();
        let node = nodeMap[rect.id];

        movingNodeMap[rect.id] = {...movedPosition,width:node.width,height:node.height};

        if(selectedIds.length>1){
            let moveOffset = {
                x:movedPosition.x - node.x,
                y:movedPosition.y - node.y
            }

            selectedIds.filter(id=>id!=rect.id).forEach(id=>{
                let refSelectedNode = nodeMap[id];
                if(!refSelectedNode){
                    return;
                }

                let refSelectedNodeGroupElem:Konva.Group = layer.findOne('#group_'+id);

                if(refSelectedNodeGroupElem){
                    let refPosition = {
                        x:refSelectedNode.x+moveOffset.x,
                        y:refSelectedNode.y+moveOffset.y
                    };

                    refSelectedNodeGroupElem.x(refPosition.x);
                    refSelectedNodeGroupElem.y(refPosition.y);

                    movingNodeMap[id] = {...refPosition,width:refSelectedNodeGroupElem.width(),height:refSelectedNodeGroupElem.height()};
                }
            });
        }

        movingLines(layer,movingNodeMap);
    }

    const movingLines = (layer,movingNodeMap) => {
        transitions.filter(transition=>movingNodeMap[transition.from] || movingNodeMap[transition.to])
        .forEach(transition=>{
            let fromNode = movingNodeMap[transition.from] || nodeMap[transition.from];
            let toNode = movingNodeMap[transition.to] || nodeMap[transition.to];

            refreshLine(layer,transition.id,fromNode,toNode);
        });
    }

    const refreshLine = (layer,transitionId,fromNode,toNode)=>{
        let line = layer.findOne('#'+transitionId);
        if(line){
            const points = getConnectorPoints(
                fromNode,
                toNode
            );

            if(points){
                line.points(points);
            }
        }
    }

    const nodeGroupMoveEnd = (rect,e) => {
        let layer = e.detail.target.parent;
        let movedPosition = e.detail.target.position();

        Object.assign(nodeMap[rect.id],movedPosition);

        if(selectedIds.length>1){
            selectedIds.filter(id=>id!=rect.id).forEach(id=>{
                let refSelectedNodeGroupElem = layer.findOne('#group_'+id);
                nodeMap[id] && Object.assign(nodeMap[id],refSelectedNodeGroupElem.position());
            });
        }
    }

    /**
     *
     * @param layer
     * @param flowNode
     */
    const refreshRefLines = (layer,nodeId,newPosition)=>{
        //查找当前节点关联的线条
        let refTransitions = transitions.filter(transition=>transition.from == nodeId || transition.to == nodeId);
        //重新计算线条位置
        refTransitions.forEach(transition=>{
            let fromNode = {...nodeMap[transition.from]};
            let toNode = {...nodeMap[transition.to]};

            if(fromNode.id == nodeId){
                fromNode = Object.assign(fromNode,newPosition);
            }

            if(toNode.id == nodeId){
                toNode = Object.assign(toNode,newPosition);
            }

            refreshLine(layer,transition.id,fromNode,toNode);
        });
    }
    /**
     *
     * @param e
     */
    const activeLine = (line,e) => {
        _activeElement(e.detail.container,line.id);
    }

    function getConnectorPoints(fromNode, toNode) {
        if(!fromNode || !toNode){
            return null;
        }

        const from = getCenterPoint(fromNode);
        const to = getCenterPoint(toNode);

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        let fromPoint = findRectAnchorPoint(fromNode,to,dx,dy);
        let toPoint = findRectAnchorPoint(toNode,from,dx,dy);

        if(!fromPoint && !toPoint){
            return null;
        }

        return [
            fromPoint.x,
            fromPoint.y,

            toPoint.x,
            toPoint.y
        ];
    }

    /**
     * 查找点和矩形中心点连接线在矩形边线的交叉点
     * @param node
     * @param point
     * @param dx
     * @param dy
     */
    function findRectAnchorPoint(node:FlowNode,point:Point,dx,dy):Point{
        let angle = Math.atan2(-dy, dx);

        let tbRadius = node.height/2/Math.sin(angle);
        let lrRadius = node.width/2/Math.cos(angle);

        //上边
        let topX = node.x+node.width/2+tbRadius*Math.cos(angle);
        let topY = node.y;

        if(topX>=node.x && topX<=node.x+node.width && Math.abs(dx)>=Math.abs(point.x-topX) && Math.abs(dy)>=Math.abs(point.y - topY)){
            return {
                x:topX,
                y:topY
            }
        }
        //下边交叉
        let bottomX = node.x+node.width/2-tbRadius*Math.cos(angle);
        let bottomY = node.y+node.height;
        if(bottomX>=node.x && bottomX<=node.x+node.width && Math.abs(dx)>=Math.abs(point.x-bottomX) && Math.abs(dy)>=Math.abs(point.y - bottomY)){
            return {
                x:bottomX,
                y:bottomY
            }
        }

        //左边交叉
        let leftX = node.x;
        let leftY = node.y+node.height/2+lrRadius*Math.sin(angle);
        if(leftY>=node.y && leftY<=node.y+node.height  && Math.abs(dy)>=Math.abs(point.y-leftY) && Math.abs(dx)>=Math.abs(point.x-leftX)){
            return {
                x:leftX,
                y:leftY
            }
        }

        //右边交叉
        let rightX = node.x+node.width;
        let rightY = node.y+node.height/2-lrRadius*Math.sin(angle);
        if(rightY>=node.y && rightY<=node.y+node.height && Math.abs(dy)>=Math.abs(point.y-rightY) && Math.abs(dx)>=Math.abs(point.x-rightX)){
            return {
                x:rightX,
                y:rightY
            }
        }
    }

    /**
     *
     * @param node
     */
    function getCenterPoint(node:FlowNode):Point{
        if(!node) return {x:0,y:0};
        return {
            x:node.x+node.width/2,
            y:node.y+node.height/2
        }
    }

    let selectionRect:Konva.Rect = null;

    const handle_stage_mousedown = (e) => {
        let stage = e.detail.currentTarget;

        showOverPanel = false;

        if(e.detail.target != stage){
            return;
        }

        selectionRect = stage.findOne('#selection');
        selectionRect.width(0);
        selectionRect.height(0);
        selectionRect.show();
        selectionRect.x(e.detail.evt.layerX)
        selectionRect.y(e.detail.evt.layerY)
    }

    const handle_stage_mousemove = (e) => {
        if(selectionRect){
            selectionRect.width(e.detail.evt.layerX - selectionRect.x());
            selectionRect.height(e.detail.evt.layerY - selectionRect.y());
        }
    }

    const handle_stage_mouseup = (e) => {
        if(selectionRect){

            let stage = e.detail.currentTarget;
            let box = selectionRect.getClientRect();

            let flowLayer = stage.findOne('#flowLayer');

            //清空上次选择
            if(selectedIds.length){
                selectedIds.forEach(selectedId=>{
                    let nodeElem = flowLayer.findOne('#'+selectedId);
                    if(nodeElem){
                        nodeElem.stroke(stroke);
                    }
                })
                selectedIds = [];
            }

            let shapes = flowLayer.find('.node');

            shapes.forEach(shape=>{
                let intersected = Konva.Util.haveIntersection(
                    box,
                    shape.getClientRect()
                );

                if(intersected){
                    shape.stroke("red");
                    selectedIds.push(shape.attrs.id);
                }
            })

            selectionRect.hide();
            selectionRect = null;
        }
    }

    let actions = {
        addRefNode(options){
            if(overGroupElem){
                let x = overGroupElem.x()+120;
                let y = overGroupElem.y();
                let width = overGroupElem.width();
                let height = overGroupElem.height();

                let overNodeId = overGroupElem.children[1].id();
                let newId = 'n'+uuid();
                nodes = nodes.concat([{id:newId,text:'新节点',name:'',x,y,width,height} as FlowNode]);
                //
                transitions = transitions.concat([{id:overNodeId+'_'+newId,from:overNodeId,to:newId} as Transition]);
            }
        },

        removeRefNode(options){
            if(overGroupElem){
                let overNodeId = overGroupElem.children[1].id();
                //
                transitions = transitions.filter(transition=>!(transition.from == overNodeId || transition.to == overNodeId));

                nodes = nodes.filter((node)=>node.id != overNodeId);

                activeNodeId = null;
                activeResizeNodeId = null;
                showOverPanel = false;
                selectedIds = [];
                if(tr){
                    tr.remove();
                }
            }
        },

        property(options){
            if(overNodeId && nodeMap[overNodeId]){
                dispatch('property',{...nodeMap[overNodeId]});
            }

        }
    };

    const dispatchAction = (options) => {
        if(options.name && is_function(actions[options.name])){
            actions[options.name](options);
        }
    }

</script>

<div class="flex-1 flex flex-full flow-container"  bind:this={refContainer}>

    <Stage class="flex-1 "
           on:mousedown={handle_stage_mousedown}
           on:mousemove={handle_stage_mousemove}
           on:mouseup={handle_stage_mouseup}>
        <Layer id="flowLayer">
            {#each lines as line}
                <Line name="transition" on:click={(e)=>activeLine(line,e)} {...line} {stroke} arrow={true} strokeWidth={3}/>
            {/each}
            {#each nodes as node}
                <Group id={'group_'+node.id} draggable={true}
                       x={node.x} y={node.y} width={node.width} height={node.height}
                       on:mouseenter={(e)=>{nodeGroupEnter(node,e)}}
                       on:mouseleave={(e)=>{nodeGroupLeave(node,e)}}
                       on:click={(e)=>activeFlowNode(node,e)}
                       on:dblclick={(e)=>{activeNodeGroupResize(node,e)}}
                       on:dragmove={(e)=>{nodeGroupMoving(node,e)}}
                       on:dragend = {(e)=>{nodeGroupMoveEnd(node,e)}}>
                    <Rect id={"resize_"+node.id}  x={0} y={0} width={node.width} height={node.height} stroke="white"/>
                    <Rect name="node" fill="#ffeeff"
                          id={node.id} x={0} y={0} width={node.width} height={node.height}
                          cornerRadius={8} {stroke}/>
                    <Text fontSize="14" fontStyle="bold" width={node.width} height={20} align="center" padding={5} text={node.text}
                          wrap={"none"} ellipsis={true}/>
                    <Rect x={0} y={21} width={node.width} height={0} {stroke}/>
                    {#if node.attrs}
                        <slot name="attrs" prop={node}>
                        {#each node.attrs as attr,index}
                            <Text fontSize="14" fill="blue" padding={5} text={attr.text} y={22+index*20} wrap={"none"} ellipsis={true}/>
                        {/each}
                        </slot>
                    {/if}
                </Group>
            {/each}
        </Layer>
        <Layer id="topLayer">
            <Rect id="selection" stroke="silver" dash={[1, 1, 1, 1]}/>
        </Layer>
    </Stage>

    <div class="flow-helper">
        <div class="over-panels"
             style:display={showOverPanel?"block":"none"}
             style:top={toPixel(overPanelTop)} style:right={toPixel(overPanelRight)}>
            <div class="over-horizontal">
                {#each topOverPanels as panel}
                    <span class:over-panel-item={true} class={"item-"+panel.name} on:click={()=>dispatchAction({name:panel.name})}>
                        {#if panel.icon}
                            <Icon data={panel.icon}/>
                        {/if}
                    </span>
                {/each}
            </div>
            <div class="over-vertical">
                {#each rightOverPanels as panel}
                    <span class="over-panel-item"></span>
                {/each}
            </div>
        </div>
    </div>
</div>
