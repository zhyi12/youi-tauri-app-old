<script lang="ts">

    import {getContext} from "svelte";
    import {DIALOG_CONTEXT_NAME, DIALOG_MEASURE_EDIT} from "../../helper";
    import {FormItem,FieldInput,FieldLabel} from "$lib/youi";

    let {dialogTitle,dialogName,dialogRecord} = getContext(DIALOG_CONTEXT_NAME);

    dialogTitle.set('编辑指标');
    dialogName.set(DIALOG_MEASURE_EDIT);

</script>

<FormItem caption="源字段">
    <FieldLabel value={$dialogRecord.name}></FieldLabel>
</FormItem>
<FormItem caption="指标名称">
    <FieldInput bind:value={$dialogRecord.text} notNull={true} placeholder={"名称"}>

    </FieldInput>
</FormItem>

