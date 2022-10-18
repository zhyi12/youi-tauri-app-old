<script>
    import {Dropdown,DropdownMenu,DropdownToggle,DropdownItem} from "../../youi/index";

    import {AGG_LIST,STR_AGG_LIST} from "./helper";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let aggregate = 'sum';

    export let dataType = 'str';

    const selectAggregate = (agg) => {
        if(aggregate != agg.name){
            aggregate = agg.name;
            dispatch('change',agg);
        }
    }

</script>

<Dropdown>
    <DropdownToggle tag="span">
        <b style="color: green;">{aggregate}</b>
    </DropdownToggle>
    <DropdownMenu>
        {#each !dataType || dataType === 'str' ? STR_AGG_LIST : AGG_LIST as agg}
            <DropdownItem  on:click={()=>selectAggregate(agg)}>
                {agg.text}
            </DropdownItem>
        {/each}
    </DropdownMenu>
</Dropdown>