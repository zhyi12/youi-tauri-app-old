<script>

    import FolderViewer from "$lib/component/FolderViewer.svelte";
    import {goto} from "$app/navigation";

    export let data;

    const handle_item_open = ({detail}) => {
        let filePath = `${data.folder}/${detail.name}`;
        goto(`/common/m-dataproc/cdm/design/${filePath}`);
    }

</script>


<FolderViewer class={"content flex-1"} rootText={"数据模型"}
              folderUri={data.folderUri} on:item-open={handle_item_open}
              folder={data.folder} metadatas={data.items}>

</FolderViewer>
