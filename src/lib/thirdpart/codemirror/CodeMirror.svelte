<script lang="ts">

    import action from "./action"
    import {classnames} from "../../youi";
    import {createEventDispatcher} from "svelte";

    let className = '';
    /*  样式 */
    export { className as class };

    export let value: string | null | undefined = "";

    export let lang = 'javascript';//

    const dispatch = createEventDispatcher();

    let editorView;//codeMirror EditorViewer

    let updating = false;

    $:classes = classnames("youi-codemirror",className)

    $: editorView && update(value);

    const init = (e) => {
        editorView = e.editor;
    }

    const docChanged = (_transaction) => {
        if(editorView && !updating){
            const new_value = editorView.state.doc.toString();
            if (new_value === value) return;
            let oldValue = value;
            dispatch("change", {value:new_value,oldValue});
        }
    }

    const optionsWithDefaults = Object.assign({docChanged,init,lang})

    /**
     *
     * @param value
     */
    function update(value: string | null | undefined): void {
        if(editorView && editorView.state){
            updating = true;
            let orgvalue = editorView.state.doc.toString();
            let transaction = editorView.state.update({
                changes: { from: 0, to: orgvalue.length, insert: value ,type:'init'},
            });
            editorView.dispatch(transaction);
            updating = false;
        }
    }

</script>

<div use:action={optionsWithDefaults} class="youi-codemirror"  style="width:100%">

</div>

<style>
    .youi-codemirror{
        border-bottom:1px solid #dddddd;
    }
</style>