<script lang="ts">
    import classnames from "../util/utils";
    import type {ButtonProps} from "../button/Button.d";
    import Button from "../button/Button.svelte";

    let className = '';
    export { className as class };

    export let buttons:ButtonProps[] = [];

    $: classes = classnames("youi-toolbar",className);
</script>

<section
        aria-label="toolbar"
        class="{classes}"
        {...$$restProps}
>
    {#each buttons as button}
        <Button {...button}></Button>
    {/each}
    <slot/>
</section>
