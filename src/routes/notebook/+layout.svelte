<script lang="ts">
    import {page} from "$app/stores";
    import {afterNavigate,goto} from "$app/navigation";
    import {NavItem,Icon,Toolbar,Button,plusIcon} from "$lib/youi/index";

    import {metadatas} from "$lib/tauri/tauri.fs";
    import type {Metadata} from "$lib/tauri/tauri.fs";
    import {APP_ICONS} from "$lib/app-icon/icons";
    import {parseFileExtension, trimFileExtension} from "$lib/util/filename.util";

    /**
     *
     */
    export let data;

    let activeLabel = data.activeLabel;
    let activeNote = '';

    let activeNotes:[Metadata] = [];//

    /**
     *
     */
    let labels = data.noteFolders.map(folder => ({name: folder.name}));

    afterNavigate(async () => {
        activeLabel = $page.params.label || data.noteFolders[0].name;
        activeNote = $page.params.file;
        //加载文件夹下的日志
        if(activeLabel){
            const files = await metadatas(`${data.notebookDir}/${activeLabel}`);
            activeNotes = files.filter(({name})=>name.endsWith('.ymd')||name.endsWith('.ymind'))
                .map(m=>({...m,text:trimFileExtension(m.name),extension:parseFileExtension(m.name)}));
            activeNotes.sort((a,b)=>{
                return a.modifiedAt.getTime()>b.modifiedAt.getTime()?1:-1;
            });

            if(!activeNote && activeNotes.length){
                activeNote = activeNotes[0].name;
                await goto(`${data.baseUri}/${activeLabel}/n-${activeNote}/${parseFileExtension(activeNote)}`,{replaceState:true});
            }
        }
    });

</script>
<div class="flex-full content flex-row">
    <div class="page-left flex-row">
        <Toolbar>
            <Button title="新建笔记">
                <Icon data={plusIcon}></Icon>
            </Button>
        </Toolbar>
        <div class="overflow">
            {#each activeNotes as note}
                <div class="option-item" class:active={activeNote == note.name} title={note.modifiedAt}>
                    <span class="item-icon">
                        <Icon data={APP_ICONS[note.extension]||APP_ICONS['list']}></Icon>
                    </span>
                    <a href={`${data.baseUri}/${activeLabel}/n-${note.name}/${note.extension}`}>{note.text}</a>
                </div>
            {/each}
        </div>
    </div>

    <div class="content flex-full">
        <div class="nav-wrapper">
            <ul class="nav nav-tabs">
                {#each labels as label,index}
                    <NavItem>
                        <a href={`${data.baseUri}/${label.name}`} class="nav-link notebook-tab"
                           class:active={label.name == activeLabel}>{label.name}</a>
                    </NavItem>
                {/each}
                <div class="flex-1 flex-pad"></div>
            </ul>
        </div>
        <slot>

        </slot>
    </div>
</div>
<style lang="scss">
  .page-left {
    width: 200px;

    .option-item{
      &.active{
        background-color: #c8dfef;
      }
    }
  }

  .nav-wrapper {
    padding: 2px 0px 0px 0px;
    overflow: hidden;

    .nav{
      flex-wrap: nowrap;
      overflow: hidden;
      padding-right: 20px;
      padding-left: 2px;

      .notebook-tab {
        display: inline-block;
        max-width: 120px;
        white-space: nowrap;
        padding: 2px 8px;
        cursor: pointer;
        color: silver;

        &.active {
          background-color: #6a74a2;
          color: white;
        }
      }
    }
  }
</style>
