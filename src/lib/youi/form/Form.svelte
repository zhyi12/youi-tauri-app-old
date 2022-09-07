<script lang='ts'>
    import { createEventDispatcher, setContext } from 'svelte';
    import classnames from '../util/utils';
    import Button from '../button/Button.svelte';

    export let method = 'post';
    export let formRecord = {};
    let className = '';
    export { className as class };
    export let beforeSubmit = async (record) => true;
    export let onSubmit = async (record) => true;

    let submitting = false;

    let fields = [];
    let dispatch = createEventDispatcher();
    let refForm: HTMLFormElement;
    $: classes = classnames(className, 'youi-form');

    setContext('FieldContainer', {
        addField: (field) => {
            fields.push(field);
        }
    });

    /**
     *
     */
    export async function submit() {
        let url = refForm.action;
        if (url && fields.length) {
            submitting = true;
            const errors = await formValidate();
            let record = fields.map(field => ({ property: field.property, value: field.getValue() }))
                .reduce((map, cur) => {
                    map[cur.property] = cur.value;
                    return map;
                }, {});

            if (errors && errors.length) {
                submitting = false;
                return;
            }
            //数据校验
            if (await beforeSubmit(record)) {
                await onSubmit(record);
                //dispatch('afterSubmit',record);
            }
            submitting = false;
        }
        return null;
    }

    /**
     * 导入reset方法，让自定义按钮可以调用
     */
    export const reset = () => {
        for (const field of fields) {
            field.reset && field.reset();
        }
    };

    /**
     * 表单校验
     * 根据 validating is-invalid 样式判断校验情况
     * 1 is-invalid：存在校验失败
     * 2 validating：校验中，用于远程异步校验
     */

    async function formValidate() {
        let errors = [];
        for (const field of fields) {
            const fieldErrors = await field.validate();
            errors = errors.concat(fieldErrors || []);
        }
        console.log(errors);
        return errors;
    }

</script>

<form class={classes}
      {...$$restProps}
      bind:this={refForm}
      on:click
      on:keydown
      on:mouseover
      on:mouseenter
      on:mouseleave
      on:submit|preventDefault={submit}>
    <slot></slot>

    <slot name='buttons'>
        <div style='text-align: right;padding-right: 25px;'>
            <Button color='primary' disabled={submitting}>提交</Button>
            <span class='btn btn-secondary' on:click={()=>{reset()}}>重置</span>
        </div>
    </slot>
</form>
