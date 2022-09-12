<script lang="ts">
    import {Offcanvas,OffcanvasBody} from "$lib/youi";
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

<Offcanvas placement="end"
        {isOpen} toggle={()=>isOpen = !isOpen} header={`创建${step?step.text:'步骤'}`} width={'90%'}>

    <OffcanvasBody>
        {#if step}
            <svelte:component this={CREATORS[step.name]}></svelte:component>
        {/if}
    </OffcanvasBody>

</Offcanvas>