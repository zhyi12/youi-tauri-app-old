/********************************************************************
 * 菜单服务
 *******************************************************************/

import type {MenuInfo} from "../../app-entity/base/menu";

/**
 * 获取app菜单
 */
const findAppMenus = async ():Promise<Array<MenuInfo>> => {

    const menus:Array<MenuInfo> = [
        {id:'010000',name:'home',text:'首页',href:"/"},
        {id:'020000',name:'geo',text:'地理信息',href:"/geo",
            children:[
                {id:'020100',name:'area',text:'行政区划',href:"/geo/area"},
                {id:'020200',name:'address',text:'地址列表',href:"/geo/address"},
                {id:'020300',name:'address',text:'边界调整',href:"/geo/geojson"},
                {id:'020400',name:'building',text:'建筑物',href:"/geo/building"},
            ]
        },
        {id:'030000',name:'res',text:'资源管理',href:"/res",
            children:[
                {id:'030100',name:'local',text:'本地',href:'/common/m-res/local/v-flat/top'},
                {id:'030200',name:'cloud',text:'云盘',href:'/common/m-res/cloud'},
            ]
        },
        {id:'040000',name:'dataproc',text:'数据处理',href:"/dataproc",children:[
            {id: "040100",name: "query",text: "自助查询",href: "/common/m-dataproc/query/top"},
            {id: "040200",name: "etl",text: "数据清洗",href: "/dataproc/etl"},
            ]},
        {id:'990000',name:'settings',text:'配置',href: '/settings',
            children:[
                {id: "990100",name: "icons",text: "图标",href: "/settings/icons"},
            ]},
    ];

    return menus;
}

export {
    findAppMenus
}