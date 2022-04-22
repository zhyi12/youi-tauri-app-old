
<script lang="ts">
    import {goto} from '$app/navigation';
    import {page} from '$app/stores';
    import {onMount} from "svelte";
    import {getDbList as getCustomDsList} from "../../services/dmp/custom-ds/service";
    import {TabContent,TabPane,Tree,walk_data_file,buildPathTree} from "$lib/youi";
    import {localFileTreeStore,dataDirStore} from "./store";

    let activeTabId:string = undefined;

    let dataDir = '/Volumes/D/data/local';
    let activeId = undefined;
    let activePath = undefined;

    let customDsLoaded = false;
    let customDsList = [];

    dataDirStore.set(dataDir);

    const handle_tree_select = (event)=>{
        if(event.detail && event.detail.datas && event.detail.datas.path && event.detail.datas.path.endsWith('.csv')){
            activePath = event.detail.datas.path;
            goto("/dmp/local/"+event.detail.id+'?path='+event.detail.datas.path);
        }
    }

    const handle_tab = async (event)=>{
        activeTabId = event.detail;
        if(event.detail==='local' && activeId){
            await goto("/dmp/local/"+activeId+'?path='+activePath);
        }else{
            if(event.detail == 'custom' && !customDsLoaded){
                let result = await getCustomDsList(null);
                customDsList = result||[];
                customDsLoaded = true;
            }
            await goto('/dmp/'+event.detail);
        }
    }

    onMount(async ()=>{
        //本地数据文件
        const paths = await walk_data_file(dataDir);
        localFileTreeStore.set(buildPathTree(paths));
    });

    /**
     * 根据路径初始化activeTab
     */
    page.subscribe((value)=>{
        activeTabId = value.routeId.split("/")[1];
    })
</script>

<div style:display="flex" class="content">
    <div class="layout-west">
        <TabContent on:tab={handle_tab}>
            <TabPane tabId="local" tab="本地" active={activeTabId=="local"}>
                <Tree bind:activeId={activeId} children={$localFileTreeStore} class="" on:select={handle_tree_select}>

                </Tree>
            </TabPane>
            <TabPane tabId="remote" tab="远程" active={activeTabId=="remote"}>
                远程数据
            </TabPane>
            <TabPane tabId="custom" tab="自助集" active={activeTabId=="custom"}>
                <ul>
                    {#each customDsList as customDs}
                        <li>{customDs.caption}</li>
                    {/each}
                </ul>
            </TabPane>
        </TabContent>
    </div>
    <div class="content-page flex-1">
        <slot></slot>
    </div>
</div>

<style>
    .content{
        background: white;
        border-radius: 5px;
    }

    .layout-west{
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .content-page{
        border-left: 1px solid #ddd;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        display: flex;
        flex-direction: column;
    }
</style>
