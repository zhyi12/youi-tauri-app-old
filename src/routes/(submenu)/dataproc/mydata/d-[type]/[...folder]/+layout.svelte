<script lang="ts">

    import {Dropdown,DropdownToggle,DropdownMenu,DropdownItem,ContextMenuOption, ContextMenuDivider, Button, Icon,plusIcon} from "$lib/youi/index";
    import FolderViewer from "$lib/component/FolderViewer.svelte";
    import {goto,afterNavigate} from "$app/navigation";
    import {APP_ICONS} from "$lib/app-icon/icons";
    import {newFolder,rename} from "$lib/tauri/tauri.fs";

    const extensions:Record<string,string> = {"ypvt":"pivotable","yqry":"query","ycht":"chart","yetl":"etl"};

    export let data;

    let selectedIds = [];
    let selectedFile = undefined;
    let showFileMenu = false;

    let renamingFile;//重命名中的文件或者文件夹

    const handle_item_open = () => {
        openDesign();
    }

    /**
     *
     * @param detail
     */
    const handle_item_select = ({detail}) => {
        if(detail.extension && extensions[detail.extension]) {
            selectedFile = {...detail};
            showFileMenu = true;
        }else if(detail.isDir){
            showFileMenu = false;
            selectedFile = {...detail};
        }
    }
    /**
     * 重命名
     * @param detail
     */
    const handle_item_rename = async ({detail}) => {
        //
        const {name,newName,index} = detail;
        if(name && newName && name != newName){
            const postfix = detail.isDir?'':('.'+detail.extension);
            const item = await rename(data.folderPath,name,newName+postfix);
            data.items[index] = {...item};
            data.items = data.items;
            renamingFile = '';
        }
    }

    const handle_contextmenu_open = ({detail}) => {
        //console.log(detail)
    }

    const findIcons = (metadata) => {
        let icon = metadata.name.split('.').pop().toLowerCase();
        return APP_ICONS[icon];
    }

    const preview = () => {
        if(selectedFile){
            goto(`${data.folderUri}/v-${selectedFile.name}`);
        }
    }

    const renameItem = async () => {
        if(selectedFile){
            renamingFile = selectedFile.name;
        }
    }
    /**
     *
     */
    const openDesign = () => {
        if(selectedFile){
            let filePath = `${data.folder}/${selectedFile.name}`;
            goto(`/common/m-dataproc/${extensions[selectedFile.extension]}/design/${filePath}`);
        }
    }
    /**
     *
     * @param type
     */
    const openCreator = (type) => {
        goto(`${data.folderUri}/creator/${type}`);
    }

    /**
     * 创建文件夹
     */
    const createFolder = async () => {
        const folder = await newFolder(data.folderPath);
        //
        data.items.push(folder);
        renamingFile = folder.name;
        data.items = data.items;
    }

    afterNavigate(()=>{
        selectedFile = undefined;
        showFileMenu = false;
        selectedIds = [];
        renamingFile = '';
    });

</script>
<div class="content flex-column flex-full">
    <FolderViewer class={"content flex-full"} rootText={data.typeCaption} icons={findIcons}
                  {selectedIds} {renamingFile}
                  folderUri={data.folderUri} 
                  on:item-open={handle_item_open}
                  on:item-select={handle_item_select}
                  on:item-rename = {handle_item_rename}
                  on:open-contextmenu={handle_contextmenu_open}
                  folder={data.folder} metadatas={data.items}>

        <svelte:fragment slot="buttons">
            <div style="width:30px;display: inline-block;">
                <Dropdown class="pull-left">
                    <DropdownToggle tag="button">
                        <Icon data={plusIcon}></Icon>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem on:click={()=>createFolder()}>
                            <span><Icon data={APP_ICONS['folder']}></Icon></span><span class="item-text">文件夹</span>
                        </DropdownItem>
                        {#if data.type === 'all' || data.type === 'query'}
                            <DropdownItem on:click={()=>openCreator('query')}>
                                <span><Icon data={APP_ICONS['query']}></Icon></span><span class="item-text">自助查询</span>
                            </DropdownItem>
                        {/if}
                        {#if data.type === 'all' || data.type === 'report'}
                            <DropdownItem on:click={()=>openCreator('report')}>
                                <span><Icon data={APP_ICONS['report']}></Icon></span><span class="item-text">报表</span>
                            </DropdownItem>
                        {/if}
                        {#if data.type === 'all' || data.type === 'pivotable'}
                            <DropdownItem on:click={()=>openCreator('pivotable')}>
                                 <span><Icon data={APP_ICONS['crossTable']}></Icon></span><span class="item-text">透视表</span>
                            </DropdownItem>
                        {/if}
                        {#if data.type === 'all' || data.type === 'chart'}
                            <DropdownItem on:click={()=>openCreator('chart')}>
                                 <span><Icon data={APP_ICONS['chart']}></Icon></span><span class="item-text">图表</span>
                            </DropdownItem>
                        {/if}
                    </DropdownMenu>
                </Dropdown>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="contextmenu">
            {#if showFileMenu}
                <ContextMenuOption labelText="预览" on:click={()=>preview()}></ContextMenuOption>
                <ContextMenuOption labelText="设计" on:click={()=>openDesign()}></ContextMenuOption>
                <ContextMenuDivider/>
            {/if}
            <ContextMenuOption labelText="重命名" on:click={()=>renameItem()}></ContextMenuOption>
            <ContextMenuOption labelText="删除" ></ContextMenuOption>
        </svelte:fragment>
    </FolderViewer>

    <slot>

    </slot>
</div>

<style>
    .item-text{
        padding-left:2px;
    }
</style>