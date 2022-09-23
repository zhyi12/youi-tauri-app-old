<script lang="ts">

    import type {Metadata} from "../tauri/tauri.fs";
    import {goto} from "$app/navigation";
    import {Input,Toolbar,Icon,folderIcon,listIcon,ContextMenu,classnames} from "../youi";
    import {isNull} from "../youi/util/utils";
    import {parseFileExtension,trimFileExtension} from "../util/filename.util";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    let className = '';
    export { className as class };

    export let icons = ()=>undefined;
    export let rootText = "根目录";
    export let view = "flat";//flat|list
    export let folder = '';//文件夹相对路径
    export let folderUri = '';//文件夹访问路径
    export let selectedIds:Array<string> = [];//选择的节点
    export let metadatas:Array<Metadata> = [];
    export let renamingFile:string = undefined;//重命名中的项

    let container:HTMLElement = undefined;

    $: rootUri = folderUri.substring(0,folderUri.length - folder.length);
    $: paths = folder.split('/').filter((path)=>!isNull(path));

    $: classes = classnames("folder-viewer",'viewer-'+view, className);

    const selectItem = (item:Metadata) => {
        selectedIds = [item.name];
        dispatch('item-select',{...item,folder,extension:parseFileExtension(item.name)});
    }

    const openItem = (item:Metadata) => {
      if(item.isDir){
          let prefix = folderUri.endsWith('/')?folderUri:(folderUri+'/');
          goto(`${prefix}${item.name}`);
      }else{
          dispatch('item-open',{...item,extension:parseFileExtension(item.name)});
      }
    }

</script>

<div class={classes}>
    <Toolbar>
        <slot name="buttons"></slot>
        <div class="file-path">
            <a class="file-part-path" href={rootUri+'top'}>{rootText}</a>
            {#each paths as path,idx}
                <span> / </span>
                {#if idx == paths.length-1}
                    <span>{path}</span>
                {:else}
                    <a class="file-part-path" href={rootUri+path}>{path}</a>
                {/if}
            {/each}
        </div>
    </Toolbar>
    <div class="folder-content flex-full" bind:this={container}>
        {#each metadatas as metadata,index}
            <div class="folder-item" class:active={selectedIds.includes(metadata.name)}
                 on:mousedown|stopPropagation={selectItem(metadata)}
                 on:dblclick={openItem(metadata)}>
                <span class="item-icon">
                    <Icon scale={3} data={metadata.isDir?folderIcon:(icons(metadata)||listIcon)}></Icon>
                </span>
                {#if renamingFile === metadata.name}
                    <Input on:blur={(e)=>dispatch('item-rename',{isDir:metadata.isDir,name:metadata.name,newName:e.target.value,index,extension:parseFileExtension(metadata.name)})}
                           on:click={(e)=>{e.stopPropagation()}}
                           on:dblclick={(e)=>e.stopPropagation()}
                           placeholder="请输入名称"
                           class="item-text" title={metadata.name}
                           value={metadata.isDir?metadata.name:trimFileExtension(metadata.name)}/>
                {:else}
                    <span class="item-text" title={metadata.name}>{metadata.isDir?metadata.name:trimFileExtension(metadata.name)}</span>
                {/if}

            </div>
        {/each}
    </div>
</div>

<ContextMenu target={container} on:open={({detail})=>{dispatch('open-contextmenu',detail)}}>
    <slot name="contextmenu">

    </slot>
</ContextMenu>

<style lang="scss">
  .file-path{
    line-height: 1.8rem;
    display: inline-block;
  }
  .file-part-path{
    text-decoration: none;
    color: blue;
  }
  .folder-content {
    padding:6px;
    background: #fdfdfd;
    .folder-item {
      float: left;
      width: 100px;
      display: flex;
      flex-direction: column;
      text-align: center;
      cursor: pointer;
      border-radius: 6px;
      margin-right: 3px;

      &:hover,&.active {
        background: #b9c6d2;
      }

      .item-icon {
        text-align: center;
        display: inline-block;
        color: #d7a872;
        line-height: 48px;
        height: 50px;
      }

      .item-text {
        height: 24px;
      }
    }
  }
</style>