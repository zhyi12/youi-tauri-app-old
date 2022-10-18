<script lang="ts">

    import {getContext} from "svelte";
    import {DIALOG_CONTEXT_NAME, DIALOG_DIMENSION_EDIT} from "../../helper";
    import {FormItem,FieldInput} from "$lib/youi";

    let {dialogTitle,dialogName,dialogRecord} = getContext(DIALOG_CONTEXT_NAME);

    dialogTitle.set('编辑维度');
    dialogName.set(DIALOG_DIMENSION_EDIT);

</script>

<FormItem>
    <FieldInput bind:value={$dialogRecord.text} notNull={true} placeholder={"名称"}>

    </FieldInput>
</FormItem>

