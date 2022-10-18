<script>
    import {afterNavigate,goto} from "$app/navigation";
    import {Offcanvas,List,Button} from "$lib/youi/index";
    import {execute} from "$lib/tauri/tauri.dsl";
    import {saveFile} from "$lib/tauri/tauri.fs";
    import FieldFileDialog from "$lib/component/FieldFileDialog.svelte";

    export let data;
    let isOpen = true;
    let canSubmit = false;

    let uri = '';
    let columns = [];

    const handle_file_selector = async ({detail}) => {
        if(detail.value){
            let script = `read_csv_header("${detail.value}")`;
            const result = await execute(script);
            columns = result.map(header=>{
                return  { id:header.name,name:header.name,text:header.name,dataType:header.dataType}
            });
            canSubmit = true;
        }
    }

    const submit = async () => {
        let newFile = `${data.folderPath}/.new_chart`;
        let pivotTable = {
            reader:'read_csv',
            uri,
            columns,
            dimensions:[],
            measureItems:[]
        };

        const result = await saveFile(newFile,JSON.stringify(pivotTable));
        if(result){
            isOpen = false;
            //跳转到创建页面
            await goto(`/common/m-dataproc/chart/design/${data.folder}/.new_chart`);
        }
    }

    afterNavigate(()=>{
        isOpen = true;
        uri = '';
        canSubmit = false;
        columns = [];
    })
</script>

<Offcanvas header={"新建图表"} placement="end" bind:isOpen={isOpen} toggle={()=>isOpen= !isOpen} width={"60%"}>

    <div class="flex-full content flex-column">
        <FieldFileDialog class="padding" bind:value={uri} property="uri" extensions={['csv']}
                         on:change={handle_file_selector}>

        </FieldFileDialog>

        <div class="flex-full list-container">
            <List items={columns} check={false}>

            </List>
        </div>
        <div class="buttons">
            <Button on:click={()=>submit()} disabled={!canSubmit}>创建</Button>
        </div>
    </div>

</Offcanvas>

<style>
    .list-container{
        border:1px solid #dddddd;
        border-radius: 6px;
        margin:6px;
    }

    .buttons{
        margin:6px;
    }
</style>