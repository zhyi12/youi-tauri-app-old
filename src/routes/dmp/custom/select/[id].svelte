<script lang="ts">
    import {List,hashtagIcon,textIcon} from "$lib/youi";
    import {page} from '$app/stores';
    import {stepStore} from "../store";
    import type {Step} from "../store";
    import {afterNavigate} from "$app/navigation";

    let step:Step = {id:'',columns:[],selectedColumnNames:[],name:'select'};

    const handle_select = (e)=>{
        stepStore.updateStep(step);
    }

    const init = ()=>{
        step = $stepStore.filter(({id})=>$page.params.id==id)[0];
    }

    afterNavigate(()=>{
        init();
    });

</script>

<List bind:items={step.columns} bind:selectedIds={step.selectedColumnNames} on:select={handle_select}
      icon={(item)=>{
        if(item && 'number'== item.dataType){
            return hashtagIcon;
        }
        return textIcon;
    }}>
</List>


