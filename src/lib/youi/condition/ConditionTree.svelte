<script lang="ts">

    import classnames, {uuid} from "../util/utils";
    import Connection from "./Connection.svelte";
    import Dropdown from "../dropdown/Dropdown.svelte";
    import DropdownMenu from "../dropdown/DropdownMenu.svelte";
    import DropdownItem from "../dropdown/DropdownItem.svelte";
    import {createEventDispatcher, setContext} from "svelte";
    import {writable} from "svelte/store";
    import DropdownToggle from "../dropdown/DropdownToggle.svelte";
    import {connItems, operatorConvert, operatorItems} from "./utils";
    import {findParentNode, findTreeNode, removeTreeNode, traverse} from "../util/tree.util";
    import {replaceItem} from "../util/array.util";

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

    export let show:string = undefined;

    let dispatch = createEventDispatcher();

    $:if(children){
        let expression = _buildExpression(children,'',1);
        show = expression.join('');
        if(show){
            dispatch('filter',{});
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
                    return  child.text +' '+ operatorConvert(child.operator||'eq')+' "'+(child.value||'')+'"';
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
    const selectSourceItem = (property,text)=>{
        if(activeId){
            dropdownCondition = {id:activeId,property: property,text: text};
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
         */
        connectCondition:(condition)=>{
            let connection = findParentNode({children:children},condition.id);
            if(connection){
                connection.children =
                    replaceItem(connection.children,condition.id,
                        {id:uuid(),name:'or',text:'或',type:'conn',children:[{...condition},{id:uuid(),text:'请选择字段',type:'cond',operator:'eq'}]});
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
        className,'youi-condition-tree','youi-tree'
    );

    $: activeNodeId.set(activeId);
    $: editingConn.set(dropdownConn);
    $: editingCondition.set(dropdownCondition);
    $: editingOperator.set(dropdownOperator);

</script>

<div class={classes} bind:this={ref}>
    <slot name="show" prop={show}>

    </slot>
    <ul class="container">
        <Connection name={conn} root={true} {children} level={0}>

        </Connection>
    </ul>

    <Dropdown bind:isOpen={connItemsOpen}>
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

    <Dropdown bind:isOpen={sourceItemsOpen}>
        <DropdownToggle tag="div" class="condition-helper" left={sourceItemsLeft} top={sourceItemsTop}>
            <span></span>
        </DropdownToggle>
        <DropdownMenu>
            {#each columns as column}
                <DropdownItem on:click={()=>{selectSourceItem(column.name,column.text||column.name)}}>{column.text||column.name}</DropdownItem>
            {/each}
        </DropdownMenu>
    </Dropdown>

    <Dropdown bind:isOpen={operatorItemsOpen}>
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
    }
</style>