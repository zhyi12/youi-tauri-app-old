<script lang="ts">

    import type {MenuInfo} from "../app-entity/base/menu";

    export let submenu:MenuInfo = {id:'',text:'',name:'',children:[]};

</script>

<div class="app-sub-menu">
    {#if submenu && submenu.children}
        {#each submenu.children as menu}
            <div class="item">
                <a href={menu.href} title={menu.text}>
                    {menu.text}
                </a>
            </div>
        {/each}
    {/if}
</div>

<style lang="scss">
  .app-sub-menu{
    width: 180px;
    border-right: 1px solid #dddddd;
  }
</style>