<script lang="ts">

    import {FieldInput} from "$lib/youi";

    export let text:string = undefined;

    export let name:string = undefined;

    export let id:string = undefined;

    export let expression:string = undefined;

</script>

<div class="option-item">
    <FieldInput bind:value={name}></FieldInput>
</div>

<div>
    <FieldInput bind:value={expression}></FieldInput>
</div>