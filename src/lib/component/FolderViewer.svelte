<script lang="ts">

    import type {Metadata} from "../tauri/tauri.fs";
    import {goto} from "$app/navigation";
    import {Toolbar,Icon,folderIcon,classnames} from "../youi";
    import {isNull} from "../youi/util/utils";

    let className = '';
    export { className as class };

    export let rootText = "根目录";
    export let view = "flat";//flat|list
    export let folder = '';//文件夹相对路径
    export let folderUri = '';//文件夹访问路径
    export let selectedIds:Array<string> = [];//选择的节点
    export let metadatas:Array<Metadata> = [];

    $: rootUri = folderUri.substring(0,folderUri.length - folder.length);
    $: paths = folder.split('/').filter((path)=>!isNull(path));

    $: classes = classnames("folder-viewer",'viewer-'+view, className);

    const clickItem = (item:Metadata) => {
        selectedIds = [item.name];
    }

    const openItem = (item:Metadata) => {
      if(item.isDir){
          goto(`${folderUri}/${item.name}`);
      }else{
          console.log(`${folderUri}${item.name}`);
      }
    }

</script>

<div class={classes}>
    <Toolbar>
        <a href={rootUri+'top'}>{rootText}</a>
        {#each paths as path,idx}
            <span> / </span>
            {#if idx == paths.length-1}
                <span>{path}</span>
            {:else}
                <a href={rootUri+path}>{path}</a>
            {/if}
        {/each}
    </Toolbar>
    <div class="folder-content container-auto-height">
        {#each metadatas as metadata}
            <div class="folder-item" class:active={selectedIds.includes(metadata.name)}
                 on:click={clickItem(metadata)}
                 on:dblclick={openItem(metadata)}>
                <span class="item-icon"><Icon scale={3} data={folderIcon}></Icon></span>
                <span class="item-text">{metadata.name}</span>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
  .folder-content {
    padding:6px;
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
      }

      .item-text {
        height: 24px;
      }
    }
  }
</style>