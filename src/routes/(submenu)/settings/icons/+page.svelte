<script lang="ts">

    import {APP_ICONS} from "$lib/app-icon/icons";
    import {Icon} from "$lib/youi";

    let icons = [];
    for (let name in APP_ICONS) {
        icons.push({
            name,
            data: APP_ICONS[name]
        })
    }

</script>
<div class="flex-1">
    {#each icons as icon}
        <span class="flex-column icon-item">
            <Icon scale="1.5" data={icon.data}></Icon>
            <div>{icon.name}</div>
        </span>
    {/each}
</div>

<style lang="scss">
  .icon-item {
    float: left;
    text-align: center;
    width: 50px;
    padding: 6px;
    border-radius: 6px;
    margin: 2px;
    cursor: pointer;
    &:hover {
      background: #b9c6d2;
    }
  }
</style>

