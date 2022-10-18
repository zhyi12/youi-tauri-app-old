<script lang="ts">

    import {setContext} from "svelte";
    import { writable} from "svelte/store";

    import {goto} from "$app/navigation";

    import DataGrid from "$lib/component/data-grid/DataGrid.svelte";

    import ColumnsPanel from "../component/ColumnsPanel.svelte";
    import {CONTEXT} from "./helper";

    import type {Writable} from "svelte/store";
    import type {Model} from "./model";

    /**
     * 页面输入数据
     */
    export let data;
    /*
     * 主数据模型
     */
    let model:Model = data.model;
    /*
     * 主模型Store
     */
    let store:Writable<Model> = writable({});

    // let commands = [];
    // let undoCommands = [];

    const openDialog = (name,options) => {
        //
        goto(`/common/m-${data.module}/report/design/${data.file}/dialog-${options.x}-${options.y}/${name}`)
    }
    /*

     */
    setContext(CONTEXT, {
        store,
        update:()=>{
            //
            model = model;
        },
        openDialog
    });

    $:store.set(model);

    const gridData = ({rowIndex,columnIndex}) => {
        return {
            text:''
        }
    }

</script>

<div class="flex flex-full">
    <ColumnsPanel>

    </ColumnsPanel>
    <div class="flex-1 content">
        <DataGrid  rows={30} columns={10} data={gridData}>

        </DataGrid>
    </div>
    <slot>

    </slot>
</div>