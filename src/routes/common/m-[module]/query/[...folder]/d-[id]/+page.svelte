<script lang="ts">
    import {getContext} from "svelte";

    export let data;

    $:id = data.id;

    $:step = data.steps.length?data.steps[0]:{};

    const {showStep} = getContext('queryStep');

    $: if(step){
        showStep(step.id);
    }

</script>

{step.reader}