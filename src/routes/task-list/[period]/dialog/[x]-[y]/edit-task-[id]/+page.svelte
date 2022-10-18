<script>

    import {page} from "$app/stores";
    import {afterNavigate} from "$app/navigation";
    import {FormItem,FieldInput} from "$lib/youi/index";
    import TooltipPage from "$lib/component/page/TooltipPage.svelte";
    import {getContext} from "svelte";
    import {CONTEXT_NAME} from "../../../../helper";
    import FieldColorPicker from "$lib/component/field/FieldColorPicker.svelte";

    export let data;

    let open = false;

    let x = 0;

    let y = 0;

    const {updateSchedule} = getContext(CONTEXT_NAME);

    const updateForm = () => {
        console.log(data.schedule)
        updateSchedule(data.schedule);
    }

    afterNavigate(({from,to})=>{
        if(from){
            open = true;
        }
        x = Math.max($page.params.x,300);
        y = $page.params.y;
    });
</script>

<TooltipPage {x} {y} bind:open>
    <div class="flex">
        <FormItem caption="" class="col-sm-9">
            <FieldInput on:change={()=>updateForm()}
                        on:keydown={(e)=>{
                            if(e.keyCode === 13){
                                updateForm()
                            }
                        }}
                        bind:value={data.schedule.text}></FieldInput>
        </FormItem>
        <FormItem caption="" class="col-sm-3">
            <FieldColorPicker on:change={()=>updateForm()} bind:value={data.schedule.color}></FieldColorPicker>
        </FormItem>
    </div>
    <FormItem caption="">
        <FieldInput value={data.schedule.start_time}></FieldInput>
    </FormItem>
    <FormItem caption="">
        <FieldInput value={data.schedule.end_time}></FieldInput>
    </FormItem>
</TooltipPage>