<script lang="ts">
    import {Modal, ModalFooter, ModalBody, Button} from "$lib/youi";
    import type {StepInfo} from "$lib/app-entity/dmp/customQuery";

    import Calculator from './_Calculator.svelte';

    const CREATORS = {
        "calculator":Calculator
    };
    /**
     * 是否显示
     * @type {boolean}
     */
    export let isOpen = false;

    export let step:StepInfo = undefined;


</script>

<Modal {isOpen} toggle={()=>isOpen = !isOpen} header={`创建${step?step.text:'步骤'}`} width={800}>

    <ModalBody>
        <svelte:component this={CREATORS[step.name]}></svelte:component>
    </ModalBody>

    <ModalFooter>
        <Button color={"primary"}>确定</Button>
    </ModalFooter>

</Modal>