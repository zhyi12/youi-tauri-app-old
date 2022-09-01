<script>
    import classnames from "../util/utils";

    let className = '';
    export { className as class };

    $: classes = classnames("youi-toolbar",className);
</script>

<section
        aria-label="toolbar"
        class="{classes}"
        {...$$restProps}
>
    <slot/>
</section>
