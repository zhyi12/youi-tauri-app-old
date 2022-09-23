<script lang="ts">

    import type {MenuInfo} from "../app-entity/base/menu";
    import {RecursiveList} from "../youi";
    import {APP_ICONS} from "../app-icon/icons";
    import {setContext} from "svelte";
    import {writable} from "svelte/store";

    export let submenu:MenuInfo = {id:'',text:'',name:'',children:[]};
    export let pathname = undefined;
    export let routeId = '';
    export let params = {};

    let selectedId = '';
    let selectedNodeId = writable("");

    $: if(pathname && routeId){
        processSubmenu(pathname,routeId);
    }

    const processSubmenu = (pathname,routeId) => {
        let activeMenu = findMenuByHref(pathname,routeId,submenu.children,params);
        if(activeMenu){
            selectedNodeId.set(activeMenu.id);

            if(activeMenu.group && params){
                processGroupMenu(activeMenu.group,submenu.children,params);
                submenu = submenu;
            }
        }
    }

    const processGroupMenu = (group,children,params) => {
        if(children.length) {
            for (let i = 0; i < children.length; i++) {
                let menu = children[i];
                if(menu.group == group && menu.name){
                    menu.href = parsePath(menu.name,params);
                }
                if(menu.children){
                    processGroupMenu(group,menu.children,params);
                }
            }
        }
    }

    setContext("ListTree",{
        selectedNodeId,
        selectNode:(_)=>{
            //ignore
        }
    })

    const findMenuIcon = (icon) => {
        return APP_ICONS[icon] || APP_ICONS['list']
    }

    const findMenuByHref = (href,routeId,children,params) => {
        if(children.length){
            for(let i=0;i<children.length;i++){
                let menu = children[i];
                if(menu.href === href){
                    return menu;
                }else if(href.indexOf(parsePath(menu.name,params)) === 0){
                    return menu;
                }
                if(menu.children){
                    return findMenuByHref(href,routeId,menu.children,params);
                }
            }
        }
        return  '';
    }

    const parsePath = (routeId,params) => {
        let path = routeId.replace(/\(\w+\)/,'');
        for(let name in params){
            let value =  encodeURIComponent(params[name]);
            path = path.replace(`[${name}]`,value);
            path = path.replace(`[...${name}]`,value);
        }
        return path;
    }

</script>

<div class="app-sub-menu">
    {#if submenu && submenu.children}
        <RecursiveList icons={findMenuIcon} children={submenu.children} class="youi-menu" itemClass={"menu-item"}>

        </RecursiveList>
    {/if}
</div>

<style lang="scss">
  .app-sub-menu{
    width: 180px;
    border-right: 1px solid #dddddd;
    background-color: #f9f9f9;
  }
</style>