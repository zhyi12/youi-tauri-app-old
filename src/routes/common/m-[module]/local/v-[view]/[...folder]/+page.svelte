<script lang="ts">

    import FolderViewer from "$lib/component/FolderViewer.svelte";

    /**
     * 页面数据
     */
    export let data;

    let baseDir = data.baseDir;//基础文件夹路径

    $: folder = data.folder;
    $: folderUri = data.folderUri;//文件夹访问路径
    $: folderPath = data.folderPath;//文件夹路径
    $: metas = data.metas;//文件夹下的文件元数据信息集合
    $: view = data.view;

</script>

<FolderViewer class={"page-container column"} {view} {baseDir} {folderUri} {folder} {folderPath} metadatas={metas}>

</FolderViewer>

