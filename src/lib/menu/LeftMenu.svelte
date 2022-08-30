<script lang="ts">
    import type {MenuInfo} from "../app-entity/base/menu";

    import {Icon, homeIcon, cogIcon, cubeIcon, hashtagIcon, hddIcon} from "../youi";

    export let menus:Array<MenuInfo> = [];

    const icons = {
        menu:hashtagIcon,
        home:homeIcon,
        'resmng':hddIcon,
        settings:cogIcon,
        'dataproc':cubeIcon
    };

</script>

<div class="app-left-menu">
    <div class="app-logo">

    </div>
    {#each menus as menu}
        <div class="menu-item">
            <a class="menu-bar" href={menu.href} title={menu.text}>
                <Icon scale={menu.scale||1.8} data={icons[menu.icon||menu.name]||icons.menu}>

                </Icon>
            </a>
        </div>
    {/each}
</div>

<style lang="scss">
  .app-left-menu {
    width: 54px;
    background:  rgba(0, 117, 246, 1);

    .menu-item{
      height: 42px;
      font-size: 32px;
      text-align: center;

      a{
        cursor: pointer;
        display: block;
        color: white;

        &:hover{
          color: black;
        }
      }

    }
  }
</style>