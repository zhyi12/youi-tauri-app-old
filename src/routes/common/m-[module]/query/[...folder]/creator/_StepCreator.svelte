<script>

    import {Modal,ModalFooter,ModalBody} from "$lib/youi";

    export let isOpen = false;

</script>

<Modal {isOpen} toggle={()=>isOpen = !isOpen} header="新建自助查询">

    <ModalBody>
        11111
    </ModalBody>

</Modal>