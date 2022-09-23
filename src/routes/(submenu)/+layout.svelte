<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {page} from "$app/stores";

    import SubMenu from "$lib/menu/SubMenu.svelte";
    import type {MenuInfo} from "$lib/app-entity/base/menu";
    import {parseActiveModule} from "$lib/menu/menu.util";

    export let data;

    let {menus,activeModule,pathname} = data;
    let params = {};
    let routeId = '';

    let submenu:MenuInfo = {id:'',text:'',name:'',children:[]};

    $: if(activeModule){
        const submenus:Array<MenuInfo> = menus.filter((menu: MenuInfo)=>menu.name===activeModule);
        submenu = (submenus && submenus.length)? submenus[0] : {id:"",name:"",text:"",children:[]};
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    afterNavigate(({_,to})=>{
        activeModule = parseActiveModule(to,{});
        pathname = to.pathname;
        params = Object.assign({},$page.params);
        routeId = $page.routeId;
    });

</script>

<SubMenu {submenu} {pathname} {params} {routeId}>

</SubMenu>

<div class="content flex-row flex-1">
    <slot>

    </slot>
</div>
