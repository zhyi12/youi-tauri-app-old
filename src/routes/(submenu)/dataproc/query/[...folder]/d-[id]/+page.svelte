<script lang="ts">
    import {Toolbar} from "$lib/youi";

    export let data;

    $:id = data.id;

</script>

<Toolbar>
    {id}
</Toolbar>
<div>

</div>
