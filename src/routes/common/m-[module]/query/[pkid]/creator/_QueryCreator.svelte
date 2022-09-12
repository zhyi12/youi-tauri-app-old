<script lang="ts">

    import {Modal,ModalBody,ModalFooter,FormItem,FieldInput,Button} from "$lib/youi/index";
    import {createEventDispatcher} from "svelte";

    const dispatcher = createEventDispatcher();

    export let isOpen = false;

    export let caption = '';
    export let folderPath = '';

    const doSave = async () => {
        dispatcher('save',{caption,folderPath});
    }

</script>

<Modal {isOpen} toggle={()=>isOpen = !isOpen} header="保存自助查询">
    <ModalBody>
        <FormItem labelWidth={"10rem"} caption="自助查询名称">
            <FieldInput bind:value={caption} property="caption" notNull={true}></FieldInput>
        </FormItem>
        <FormItem caption="上级文件夹">
            <FieldInput bind:value={folderPath} property="folderPath" notNull={true}></FieldInput>
        </FormItem>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={()=>doSave()}>
            保存
        </Button>
    </ModalFooter>
</Modal>