import type {MenuInfo} from "../../app-entity/base/menu";

/**
 * 获取app菜单
 */
const findAppMenus = async ():Promise<Array<MenuInfo>> => {

    const menus:Array<MenuInfo> = [
        {id:'010000',name:'home',text:'首页',href:"/"},
        {id:'020000',name:'resmng',text:'资源管理',href:"/res",
            children:[{id:'020100',name:'local',text:'本地',href:'/common/m-res/local'}]
        },
        {id:'030000',name:'dataproc',text:'数据处理',href:"/data-proc"},
        {id:'999999',name:'settings',text:'配置',href: '/settings'},
    ];

    return menus;
}

export {
    findAppMenus
}