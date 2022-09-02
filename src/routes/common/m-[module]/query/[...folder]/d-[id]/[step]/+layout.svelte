<script lang="ts">

    import {getContext} from "svelte";
    import {page} from "$app/stores";

    const {showStep} = getContext('queryStep');

    $: if($page.params.step){
        showStep($page.params.step);
    }
</script>

<slot>

</slot>