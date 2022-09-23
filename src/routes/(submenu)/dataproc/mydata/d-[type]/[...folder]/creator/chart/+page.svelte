<script>
    import {Offcanvas,OffcanvasBody} from "$lib/youi/index";
    import {afterNavigate} from "$app/navigation";
    export let data;
    let isOpen = true;

    afterNavigate(()=>{
        isOpen = true;
    })
</script>

<Offcanvas header={"新建图表"} placement="end" bind:isOpen={isOpen} toggle={()=>isOpen= !isOpen} width={"60%"}>
    <OffcanvasBody>
        <span>{data.folder}</span>
    </OffcanvasBody>
</Offcanvas>