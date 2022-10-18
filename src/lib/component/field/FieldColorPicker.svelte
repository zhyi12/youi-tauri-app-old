<script lang="ts">
    import ColorPicker from "../../thirdpart/color-picker/ColorPicker.svelte";
    import {createEventDispatcher} from "svelte";
    import {Dropdown,DropdownMenu,DropdownToggle} from "../../youi/index";

    let dispatch = createEventDispatcher();

    export let value = undefined;

    const handle_color_change = ({detail}) => {
        value = detail.hex;
        dispatch('change',{value});
    }

</script>


<Dropdown>
    <DropdownToggle>
        <div style:color={value}>{value}</div>
    </DropdownToggle>
    <DropdownMenu>
        <ColorPicker startColor={value||'#FF0000'} on:colorChange={handle_color_change}>

        </ColorPicker>
    </DropdownMenu>
</Dropdown>
