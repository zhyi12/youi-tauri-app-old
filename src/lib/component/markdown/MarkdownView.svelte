
<script lang="ts">
    import {classnames} from "../../youi/index";

    let className = '';
    /*  样式 */
    export { className as class };

    $: classes = classnames(
        className,'youi-markdown-view'
    );
</script>

<div class={classes}>
    view
</div>