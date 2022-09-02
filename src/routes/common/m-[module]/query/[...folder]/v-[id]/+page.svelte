<script>
    import {Toolbar} from "$lib/youi";

    export let data;

    $:id = data.id;

</script>

<Toolbar>
    view {id}
</Toolbar>