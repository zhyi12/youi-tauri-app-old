<script lang="ts">
    import PivotTable from "$lib/component/pivot-table/PivotTable.svelte";
    import type {Dimension,MeasureItem} from "$lib/component/cube/DataCube.d";

    /**
     * 行维度集合
     */
    let rowDimensions:Dimension<any>[] =
        [
        {
            id:'province',
            name:'province',
            text:'省份',
            items:[
                {id:'11',text:'北京',level:1},
                {id:'50',text:'重庆',level:1},
                {id:'groupSum',text:'小计'},
            ]
        },
        {
            id:'regType',
            name:'regType',
            text:'登记注册类型',
            items:[
                {id:'100',text:'内资企业',level:1},
                {id:'110',text:'国有企业',level:2},
                {id:'120',text:'集体企业',level:2},
                {id:'200',text:'港、澳、台商投资企业',level:1},
                {id:'300',text:'外资企业',level:1},
            ]
        },{
            id:'openStatus',
            name:'openStatus',
            text:'经营状态',
            items:[{id:'1',text:'开业',level:1},
                {id:'9',text:'注销',level:1}]
        }
    ];
    /**
     * 列维度集合
     */
    let colDimensions:Dimension<any>[] = [];
    /**
     *
     */
    let measureItems:MeasureItem[] = [
        {id:'id_count',name:'id',text:'计数',aggregate:'count',level:1},
        {id:'adv_sum',name:'adv',text:'总投资',aggregate:'sum',level:1},
    ];

</script>

<PivotTable {rowDimensions} {colDimensions} {measureItems}>

</PivotTable>