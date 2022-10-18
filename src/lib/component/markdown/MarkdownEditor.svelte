<!-- **********************************************************************
*
*    markdown 格式编辑器
*************************************************************************-->

<script lang="ts">
    import CodeMirror from '../../thirdpart/codemirror/CodeMirror.svelte';
    import MarkdownView from './MarkdownView.svelte';


</script>

<div class="youi-markdown-editor flex flex-full">
    <div class="source-container">
        <CodeMirror class="flex-1" lang="markdown">

        </CodeMirror>
    </div>

    <MarkdownView class="flex-1">

    </MarkdownView>
</div>

<style>
    .source-container{
        width:50%;
        border-right: 1px solid #dddddd;
    }
</style>