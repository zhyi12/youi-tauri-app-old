<script lang="ts">

    import {getContext} from "svelte";
    import {page} from "$app/stores";
    import {afterNavigate} from "$app/navigation";

    const {steps,activeId} = getContext('queryStep');

    $: if($page.params.step){
        activeId.set($page.params.step);
    }

    afterNavigate(()=>{
        if($steps.filter(({id})=>id === $page.params.step).length===0){
            //const baseUri = `/common/m-${$page.params.module}/query/${$page.params.folder}/d-${$page.params.id}`;
            //goto(baseUri,{replaceState:true,state:'new'});
        }
    });
</script>

<slot>

</slot>