<script>
    import {getContext, setContext} from "svelte";
    import {writable} from "svelte/store";
    import {afterNavigate} from "$app/navigation";

    import {Modal,ModalBody,Form} from "$lib/youi/index";

    import {DIALOG_ADD, DIALOG_CONTEXT_NAME, CHART_DESIGN} from "../helper";


    let isOpen = false;

    let title = '';
    let name = '';
    let width = 600;
    let formRecord = {};//提交的数据

    let dialogTitle = writable(title);
    let dialogWidth = writable(width);
    let dialogRecord = writable(formRecord);
    let dialogName = writable(name);

    $: dialogTitle.set(title);
    $: dialogWidth.set(width);
    $: dialogRecord.set(formRecord);

    let {getFormRecord,afterDialogSubmit} = getContext(CHART_DESIGN);

    setContext(DIALOG_CONTEXT_NAME,{
        dialogTitle,
        dialogName,
        dialogWidth,
        dialogRecord
    });

    /**
     * 数据提交
     */
    const submit = async () => {
        //数据保存
        await afterDialogSubmit(name,{...$dialogRecord});
        isOpen = false;
    }

    afterNavigate(({to})=>{
        name = to.pathname.split('/').pop();
        formRecord = getFormRecord(name);
        if(formRecord && Object.keys(formRecord).length){
            isOpen = true;
        }
    });
</script>

<Modal bind:isOpen header={$dialogTitle} toggle={()=>isOpen = !isOpen}>
    <ModalBody>
        <Form onSubmit={submit}>
            <slot>

            </slot>
        </Form>
    </ModalBody>
</Modal>

