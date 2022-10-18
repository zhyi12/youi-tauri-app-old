<script lang="ts">

    import {getContext} from "svelte";
    import {DIALOG_CONTEXT_NAME} from "../../helper";
    import {FormItem,FieldInput,FieldLabel} from "$lib/youi";

    let {dialogTitle,dialogName,dialogRecord} = getContext(DIALOG_CONTEXT_NAME);

    dialogTitle.set('保存图表');
    dialogName.set('add');

</script>

<FormItem>
    <FieldLabel value={$dialogRecord.folderPath}></FieldLabel>
</FormItem>
<FormItem>
    <FieldInput bind:value={$dialogRecord.caption} notNull={true} placeholder={"输入图表名称"}>

    </FieldInput>
</FormItem>

