<script>
    import {Toolbar,buildPathTree,Button,RecursiveList,Icon,plusIcon} from "$lib/youi";
    import StepCreator from './creator/_StepCreator.svelte';
    export let data;

    let children = [];//树节点

    $:module = data.module;
    $:folder = data.folder;

    let showCreator = false;

    function buildChildren(queryList) {
        let treePaths = [];//queryList.map(query=>query.query_path);
        let pathDataMap = {};
        queryList.forEach(query=>{
            let path = (query.query_path||'')+ '/' + query.caption;
            treePaths.push(path);
            pathDataMap[path] = Object.assign(query,{html:`<span class="hover-group"><a href="/common/m-${module}/query/${folder}/v-${query.id}">${query.caption}</a><a class="btn-icon hover-item" href="/common/m-${module}/query/${folder}/d-${query.id}">编辑</a></span>`});
            if(query.query_path){
                let parts = query.query_path.split('/').filter(part=>part!='');
                for(let i=1;i<=parts.length;i++){
                    let partPath = "/"+parts.slice(0,i).join('/');
                    if(!treePaths.includes(partPath)){
                        treePaths.push(partPath);
                        pathDataMap[partPath] = {group:'folder'};
                    }
                }
            }
        });
        treePaths.sort();
        return buildPathTree(treePaths,'',pathDataMap);
    }

    $:if(data.queryList && data.queryList.length){
        children = buildChildren(data.queryList);
    }

</script>

<div style="width:210px;" class="page-left">
    <Toolbar>
        <Button title="新增" on:click={()=>showCreator = true}>
            <Icon data={plusIcon}></Icon>
        </Button>

        <Button class="pull-right" href={`/${module}`}>
            返回
        </Button>
    </Toolbar>

    <RecursiveList class="youi-tree" {children}>

    </RecursiveList>

</div>

<div class="page-container flex-column">
    <slot>

    </slot>
</div>

<StepCreator bind:isOpen={showCreator}>

</StepCreator>
