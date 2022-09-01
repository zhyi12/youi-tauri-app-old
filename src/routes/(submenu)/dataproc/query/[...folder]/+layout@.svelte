<script>


import {Toolbar} from "$lib/youi";
</script>

<div style="width:240px;" class="page-left">
    <Toolbar>
        <a class="btn" href="/dataproc">返回</a>
    </Toolbar>

    <div>
        <a href={'/dataproc/query/d-query001'}>查询001</a>
    </div>
    <div>
        <a href={'/dataproc/query/d-query002'}>查询002</a>
    </div>
</div>

<div class="page-container">
    <slot>

    </slot>
</div>
