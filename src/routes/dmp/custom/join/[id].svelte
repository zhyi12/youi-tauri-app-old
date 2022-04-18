<script>
    import {stepStore} from "../store";
    import {page} from "$app/stores";
    import {findStepColumns} from "../utils";
    import FieldSelect from "../../../../lib/youi/field/FieldSelect.svelte";
    import FieldInput from "../../../../lib/youi/field/FieldInput.svelte";

    const JOIN_TYPES = [{name:'left join',text:'左连接'},{name:'right join',text:'右连接'}
        ,{name:'inner join',text:'内连接'},{name:'outer join',text:'外连接'}];

    let step = null;

    let columns = [];

    let rightColumns = [];

    let joinColumns = [];

    stepStore.subscribe((steps)=>{
        step = steps.filter(({id}) => $page.params.id == id)[0];
        joinColumns = step.joinColumns;
        columns = findStepColumns(steps,step);
    });


</script>

<div style="width:24%;border-right: 1px solid #ddd;padding-right: 6px;">
    <div>
        连接数据
        <FieldInput bind:value={step.joinTable}></FieldInput>
    </div>
    <div>
        连接方式
        {#each  JOIN_TYPES as item}
            <div class="option-item" class:active={item.name===step.joinType} on:click={()=>{step.joinType=item.name}}>
                {item.text}
            </div>
        {/each}
    </div>
</div>
<div class="flex-1">
    <div class="flex" style="padding:6px;text-align: center">
        <div style="flex:1;padding:1px 8px;">
            合并结果
        </div>
        <div style="flex:1;padding:1px 8px;">
            当前表
        </div>
        <div style="flex:1;padding:1px 8px;">
            合并表
        </div>
    </div>
    {#each joinColumns as joinColumn}
    <div class="flex" style="padding:6px;">
        <div style="flex:1;padding:1px 8px;">
            <FieldInput value={joinColumn.name}></FieldInput>
        </div>
        <div style="flex:1;padding:1px 8px;">
            <FieldSelect items={columns}></FieldSelect>
        </div>
        <div style="flex:1;padding:1px 8px;">
            <FieldSelect items={rightColumns}></FieldSelect>
        </div>
    </div>
    {/each}

</div>
