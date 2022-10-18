<script>
    import {Icon} from "$lib/youi/index";

    export let items = [];

    export let type;//图表类型

    export let activeChartType = undefined;//

</script>

{#each items as chartType}
    <div class="col-sm-1 chart-item" class:active={chartType.name === type} title={chartType.text}
         on:click={()=>{
             activeChartType=chartType;
             type = chartType.name;
         }}>
        <Icon scale={2} data={chartType.icon}/>
    </div>
{/each}

<style lang="scss">
  .chart-item {
    cursor: pointer;
    float:left;
    width:48px;
    height:48px;
    line-height: 48px;
    text-align: center;
    margin: 0px 2px 6px 2px;

    &:hover,&.active {
      color: blue;
      background-color: #b9c6d2;
      border-radius: 6px;
    }
  }
</style>