<script>
    import {Offcanvas,Button} from "$lib/youi/index";
    import {afterNavigate, goto} from "$app/navigation";
    export let data;
    let isOpen = true;

    afterNavigate(()=>{
        isOpen = true;
    })
</script>

<Offcanvas header={"新建自助查询"} placement="end" bind:isOpen={isOpen} toggle={()=>isOpen= !isOpen} width={"60%"}>
    <div>
        <Button on:click={()=>{
            isOpen = false;
            goto(`/common/m-dataproc/query/design/.create`);
        }}>空白自助查询</Button>

        <Button>本地文件复制</Button>
    </div>

    <div class="flex flex-column query-templates">
        <div class="padding">自助查询模版</div>
    </div>
</Offcanvas>

<style>
    .query-templates{
        padding:6px 0px;
    }
</style>