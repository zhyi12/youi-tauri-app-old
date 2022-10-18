/********************************************************************
 * 菜单服务
 *******************************************************************/

import type {MenuInfo} from "../../app-entity/base/menu";

/**
 * 获取app菜单
 */
const findAppMenus = async ():Promise<Array<MenuInfo>> => {

    const menus:Array<MenuInfo> = [
        {id:'010000',name:'home',text:'首页',href:"/",icon:'home'},
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
        {id:'040000',name:'dataproc',text:'数据处理',href:"/dataproc/mydata/d-all/top",children:[
            {id: "040100",name: "datamodel",text: "数据建模",href: "/dataproc/model/top",icon:'database'},
            {id: "040200",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-all/[...folder]",text: "我的数据",href: "/dataproc/mydata/d-all/top",icon:'folder',children:[
                    {id: "040201",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-query/[...folder]",text: "自助查询",href: "/dataproc/mydata/d-query/top",icon:"query"},
                    {id: "040202",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-pivotable/[...folder]",text: "透视表",href: "/dataproc/mydata/d-pivotable/top",icon:"crossTable"},
                    {id: "040203",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-chart/[...folder]",text: "图表",href: "/dataproc/mydata/d-chart/top",icon:"chart"},
                    {id: "040204",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-etl/[...folder]",text: "数据清洗",href: "/dataproc/mydata/d-etl/top",icon:"etl"},
                    {id: "040205",group:"dataproc-mydata", name: "(submenu)/dataproc/mydata/d-report/[...folder]",text: "报表",href: "/dataproc/mydata/d-report/top",icon:"report"}
                ]}
            ]},
        {id:'910000',name:'notebook',text:'记事本',href: '/notebook',icon:'notebook'},
        {id:'920000',name:'taskList',text:'日程',href: '/task-list/month',icon:'taskList'},
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