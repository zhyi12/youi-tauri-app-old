<script lang="ts">

    import type {MenuInfo} from "../app-entity/base/menu";
    import {RecursiveList} from "../youi";

    export let submenu:MenuInfo = {id:'',text:'',name:'',children:[]};
    export let pathname = undefined;

</script>

<div class="app-sub-menu">
    {#if submenu && submenu.children}
        <RecursiveList activeHref={pathname} children={submenu.children} class="youi-menu" itemClass={"menu-item"}>

        </RecursiveList>
    {/if}
</div>

<style lang="scss">
  .app-sub-menu{
    width: 180px;
    border-right: 1px solid #dddddd;
  }
</style>