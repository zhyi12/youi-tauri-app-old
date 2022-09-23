<script lang="ts">

    import {getContext} from "svelte";

    import {FieldInput} from "$lib/youi/index";

    import {DIALOG_CONTEXT_NAME} from "../../helper";

    let {dialogTitle,dialogRecord} = getContext(DIALOG_CONTEXT_NAME);

    let record = {text:''};
    dialogTitle.set('维度配置');

    dialogRecord.set(record);

</script>

<FieldInput bind:value={record.text} notNull={true} placeholder={""}>

</FieldInput>