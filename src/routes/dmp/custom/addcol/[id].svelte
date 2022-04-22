<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import { stepStore} from "../store";
    import type {Step} from "../store";
    import {page} from "$app/stores";

    let step:Step = {id:'',name:'addcol',addedColumn:{name:'',expression:''}};

    const init = ()=>{
        step = $stepStore.filter(({id})=>$page.params.id==id)[0];
    }

    afterNavigate(()=>{
        init();
    });

</script>

<div class="option-item">
    {step.addedColumn.expression}
</div>


<style>
    .option-item{
        border:1px solid #dddddd;
        padding:3px 8px;
        border-radius: 6px;
    }
</style>