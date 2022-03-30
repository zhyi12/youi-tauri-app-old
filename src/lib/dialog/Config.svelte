<script lang="ts">

    import Modal from "../youi/modal/Modal.svelte";
    import ModalHeader from "../youi/modal/ModalHeader.svelte";
    import ModalFooter from "../youi/modal/ModalFooter.svelte";
    import ModalBody from "../youi/modal/ModalBody.svelte";
    import Button from "../youi/button/Button.svelte";

    export let isOpen = false;
    export let items = [];

    const toggle = ()=>{
        isOpen = !isOpen;
    };

</script>

<Modal {isOpen}>
    <ModalHeader {toggle}>系统配置</ModalHeader>
    <ModalBody>
        <ul>
        {#each items as item}
            <li>{item.name} - {item.value}</li>
        {/each}
        </ul>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggle}>提交</Button>
        <Button color="secondary" on:click={toggle}>取消</Button>
    </ModalFooter>
</Modal>