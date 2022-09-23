<script>

    import {Offcanvas,OffcanvasBody} from "$lib/youi/index";
    import {afterNavigate} from "$app/navigation";

    export let data;

    let isOpen = false;

    afterNavigate(()=>{
        isOpen = true;
    })

</script>

<Offcanvas header={"数据预览"} placement="end" bind:isOpen={isOpen} toggle={()=>isOpen= !isOpen} width={"90%"}>
    <OffcanvasBody>
        <span>{data.folder}</span><span>/{data.file}</span>
    </OffcanvasBody>
</Offcanvas>

<style>
    .status{
        background: #f9f9f9;
        line-height: 32px;
    }
</style>