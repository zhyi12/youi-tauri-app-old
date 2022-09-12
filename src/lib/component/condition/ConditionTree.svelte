<script  lang="ts">
    import {createEventDispatcher, setContext} from "svelte";
    import {writable} from "svelte/store";
    import {Dropdown,DropdownMenu,DropdownItem,DropdownToggle,uuid,
        classnames,toPixel,findParentNode, findTreeNode, removeTreeNode,replaceItem} from "../../youi";
    import Connection from "./Connection.svelte";

    import {connItems, operatorConvert, operatorItems} from "./utils";

    let className = '';
    /*  样式 */
    export { className as class };
    /**
     * 条件集合
     */
    export let children = [{id:'root',text:'且',name:'and',type:'conn'}];

    export let columns = [];

    export let conn = "and";// and or

    export let activeId = undefined;

    export let height:number = undefined;

    export let show:string = undefined;

    let dispatch = createEventDispatcher();

    $:if(children){
        let expression = _buildExpression(children,'',1);
        show = expression.join('');
        if(show){
            dispatch('change',{show});
        }
    }

    function _buildExpression(children,conn,level){
        let expression = [];

        if(Array.isArray(children) && children.length){
            if(level>2){
                expression.push("(")
            }

            let expr = children.map(child=>{
                if(child.children && child.children.length ){
                    return _buildExpression(child.children, child.name, level+1).join('');
                }else if(child.id!='root'){
                    let wrap = child.dataType=='str'?'"':'';
                    return  child.text +' '+ operatorConvert(child.operator||'eq')+wrap+(child.value||'')+wrap;
                }
            }).join(' '+conn+' ');

            expression.push(expr);

            if(level>2){
                expression.push(")")
            }
        }

        return expression;
    }

    let ref:HTMLElement = null;

    let connItemsOpen  = false;
    let connItemsLeft = 0;
    let connItemsTop = 0;

    let sourceItemsOpen  = false;
    let sourceItemsLeft = 0;
    let sourceItemsTop = 0;

    let operatorItemsOpen  = false;
    let operatorItemsLeft = 0;
    let operatorItemsTop = 0;

    let dropdownConn = {id:null,name:null,text:null};
    let dropdownCondition = {id:null,property:null,text:null};
    let dropdownOperator = {id:null,name:null,text:null};

    const activeNodeId = writable(activeId);
    const editingConn = writable(dropdownConn);
    const editingCondition = writable(dropdownCondition);
    const editingOperator = writable(dropdownOperator);

    /**
     *
     * @param connName
     * @param connText
     */
    const selectConn = (connName,connText)=>{
        if(activeId){
            dropdownConn = {id:activeId,name:connName,text:connText};
            //更新数据
            updateNodeEdit(children,dropdownConn);
        }
    }

    /**
     *
     * @param property
     * @param text
     */
    const selectSourceItem = (property,text,dataType)=>{
        if(activeId){
            dropdownCondition = {id:activeId,property,text,dataType};
            console.log(dropdownCondition)
            //更新数据
            updateNodeEdit(children,dropdownCondition);
        }
    }

    /**
     *
     * @param name
     * @param text
     */
    const selectOperatorItem = (name,text)=>{
        if(activeId){
            dropdownOperator = {id:activeId,name: name,text:text};
            updateNodeEdit(children,{id:activeId,operator:name});
        }
    }

    $:rootId = children.length?children[0].id:'';
    /**
     *
     * @param nodes
     * @param node
     */
    const updateNodeEdit = (nodes,node)=>{
        nodes.forEach(curNode=>{
            if(curNode.id == node.id){
                Object.assign(curNode,node);
            }else if(curNode.children){
                updateNodeEdit(curNode.children,node);
            }
        });
        children = children;
    }

    /**
     *
     */
    setContext("ConditionTree", {
        activeNodeId,
        editingConn,
        editingCondition,
        editingOperator,
        clickNode: (node,event) => {
            activeId = node.id;
            if(node.type == 'conn'){
                connItemsOpen = true;
                connItemsLeft = event.target.offsetLeft;
                connItemsTop = event.target.offsetTop+20;
            }else if(node.type == 'cond'){
                sourceItemsOpen = true;
                sourceItemsLeft = event.target.offsetLeft;
                sourceItemsTop = event.target.offsetTop+20;
            }
        },

        /**
         *
         * @param parent
         */
        addCondition:(parent)=>{
            let connection = findTreeNode(children,parent.id);
            if(connection){
                connection.children = connection.children||[];
                connection.children.push({
                    id:uuid(),
                    text:'请选择字段',
                    type:'cond',
                    operator:'eq'
                });
            }
            children = children;
        },
        /**
         *
         * @param condition
         * @param name and | or
         */
        connectCondition:(condition,name)=>{
            name = name||'or';
            let connection = findParentNode({children:children},condition.id);
            if(connection){
                if(name == connection.name){
                    //增加子节点
                    connection.children.push({id:uuid(),text:'请选择字段',type:'cond',operator:'eq'});
                }else{
                    connection.children =
                        replaceItem(connection.children,condition.id,
                            {id:uuid(),name:name,text:name==='and'?'且':'或',type:'conn',children:[{...condition},{id:uuid(),text:'请选择字段',type:'cond',operator:'eq'}]});
                }
            }
            children = children;
        },

        /**
         *
         * @param condition
         */
        removeCondition: (condition)=>{
            let parent = removeTreeNode(children,condition.id,null);
            if(parent!=null && parent.id!=rootId && parent.children.length==0){
                removeTreeNode(children,parent.id,null)
            }else if(parent!=null && parent.id!=rootId && parent.children.length==1){
                //删除连接，条件移动到连接节点位置
                let parentConnection = findParentNode({children:children},parent.id);
                if(parentConnection){
                    parentConnection.children = replaceItem(parentConnection.children,parent.id,parent.children[0]);
                }
            }
            children = children;
        },
        reload:()=>{
            children = children;
        },
        /**
         * @param name
         * @param node
         * @param event
         */
        openDropdown:(name,node,event)=>{
            activeId = node.id;
            if(name=='operator'){
                operatorItemsOpen = true;
                operatorItemsLeft = event.target.offsetLeft;
                operatorItemsTop = event.target.offsetTop+20;
            }
        }
    });

    $: classes = classnames(
        className,'youi-condition-tree'
    );

    $: activeNodeId.set(activeId);
    $: editingConn.set(dropdownConn);
    $: editingCondition.set(dropdownCondition);
    $: editingOperator.set(dropdownOperator);

    const handle_scroll = (e)=>{
        operatorItemsOpen = false;
        sourceItemsOpen = false;
        connItemsOpen = false;
    }

</script>

<div class={classes} bind:this={ref} on:scroll={handle_scroll}>
    <slot name="show" prop={show}>

    </slot>
    <ul class="container" style:max-height={toPixel(height)}>
        <Connection name={conn} root={true} {children} level={0}>

        </Connection>
    </ul>

    <Dropdown bind:isOpen={connItemsOpen} class="fixed">
        <DropdownToggle tag="div" class="conn-helper" left={connItemsLeft} top={connItemsTop}>
            <span></span>
        </DropdownToggle>
        <DropdownMenu>
            {#each connItems as connItem}
                <DropdownItem on:click={()=>{selectConn(connItem.name,connItem.text)}}>
                    {connItem.text}
                </DropdownItem>
            {/each}
        </DropdownMenu>
    </Dropdown>

    <Dropdown bind:isOpen={sourceItemsOpen} class="fixed">
        <DropdownToggle tag="div" class="condition-helper" left={sourceItemsLeft} top={sourceItemsTop}>
            <span></span>
        </DropdownToggle>
        <DropdownMenu>
            {#if columns}
                {#each columns as column}
                    <DropdownItem on:click={()=>{selectSourceItem(column.name,column.text||column.name,column.dataType)}}>{column.text||column.name}</DropdownItem>
                {/each}
            {/if}
        </DropdownMenu>
    </Dropdown>

    <Dropdown bind:isOpen={operatorItemsOpen} class="fixed">
        <DropdownToggle tag="div" class="condition-helper" left={operatorItemsLeft} top={operatorItemsTop}>
            <span></span>
        </DropdownToggle>
        <DropdownMenu>
            {#each operatorItems as operatorItem}
                <DropdownItem on:click={()=>{selectOperatorItem(operatorItem.name,operatorItem.text)}}>
                    {operatorItem.text}
                </DropdownItem>
            {/each}
        </DropdownMenu>
    </Dropdown>
</div>

<style>
    .container{
        border-bottom: 1px solid silver;
        border-right: 1px solid silver;
        padding: 0px;
        overflow-y:auto;
    }
</style>