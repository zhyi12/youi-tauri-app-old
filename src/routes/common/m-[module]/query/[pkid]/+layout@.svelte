<script lang="ts">
    import {setContext} from "svelte";
    import {page} from "$app/stores";

    import {Toolbar,buildPathTree,Button,ListTree,Icon,plusIcon,folderIcon} from "$lib/youi";

    import QueryCreator from './creator/_QueryCreator.svelte';
    import {insertCustomQuery} from "$lib/app-services/dmp/customQueryServices";
    import type {CustomQuery} from "$lib/app-entity/dmp/customQuery";
    import {writable} from "svelte/store";

    export let data;

    let children = [];//树节点
    let selectedId = '';
    let selectedData = {};

    let module = data.module;
    let pkid = data.pkid;

    let showQueryCreator = false;
    let addingSteps = undefined;

    let activeQuery = writable({});//当前选择的节点项
    let query = undefined;

    $:if(data.queryList && data.queryList.length){
        children = buildChildren(data.queryList);
        query = data.queryList.filter(({id})=>id == $page.params.id)[0];
    }

    $: activeQuery.set(query);

    setContext('module_query',{
        activeQuery,
        addQuery:({steps})=>{
            addingSteps = steps;
            showQueryCreator = true;
        }
    });

    function buildChildren(queryList) {
        let treePaths = [];
        let pathDataMap = {};
        queryList.forEach(query=>{
            let path = (query.folder_path||'')+ '/' + query.caption;
            treePaths.push(path);
            pathDataMap[path] = Object.assign(query,{html:`<span class="hover-group"><a href="/common/m-${module}/query/${pkid}/v-${query.id}">${query.caption}</a><a class="btn-icon hover-item" href="/common/m-${module}/query/${pkid}/d-${query.id}">编辑</a></span>`});
            if(query.folder_path){
                let parts = query.folder_path.split('/').filter(part=>part!='');
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
        //console.log(treePaths)
        return buildPathTree(treePaths,'',pathDataMap);
    }

    const handle_save = async ({detail}) => {
        if(!addingSteps){
            return;
        }

        let newQuery:CustomQuery = {name:'',caption:detail.caption,folder_path:detail.folderPath
            ,query_app:'res'
            ,query_group:'dataproc',content:JSON.stringify(addingSteps)
        };

        //保存自助查询并返回生成的id
        const id = await insertCustomQuery(newQuery);
        newQuery.id = id;

        data.queryList.push(newQuery);
        data.queryList = data.queryList;

        showQueryCreator = false;
    }

    const handle_tree_select = ({detail}) => {
        selectedData = detail.datas;
    }

</script>

<div style="width:210px;" class="page-left">
    <Toolbar>
        <Button title="新建自助查询" href={`/common/m-${module}/query/${pkid}/d-create`}>
            <Icon data={plusIcon}></Icon>
        </Button>

        <Button class="pull-right" href={`/${module}`}>
            返回
        </Button>
    </Toolbar>

    <ListTree bind:selectedId = {selectedId} {children} on:select={handle_tree_select}>

    </ListTree>

</div>

<div class="flex-1 content">
    <slot>

    </slot>
</div>

<QueryCreator bind:isOpen={showQueryCreator} folderPath={selectedData.folder_path||selectedData.path}

               on:save={handle_save}></QueryCreator>
