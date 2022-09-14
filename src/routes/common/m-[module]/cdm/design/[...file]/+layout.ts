import type { LayoutLoad } from './$types';
import type {TreeNode} from "$lib/youi/tree/Tree";
import type {FlowNode,Transition} from "$lib/component/flow/Flow";

type Diagram = {
    id:string,
    x:number,
    y:number,
    width:number,
    height:number
}
/**
 *
 * @param parent
 * @param params
 */
export const load: LayoutLoad = async ({parent,params}) => {

    const appContext = await parent();

    const {file,module,id} = params;

    const filePath = `${file}`;
    const folder = file.split('/').filter(part=>!file.endsWith(part)).join('/');

    const model = {
        children:[
            {
                id:"f01",text:"部门数据",group:"package",children:[
                    {id:"t0001",text:"编办-机关群团",group:"table"},
                    {id:"t0002",text:"编办-事业单位",group:"table"},
                    {id:"t0003",text:"民政-社会组织",group:"table"},
                    {id:"t0004",text:"民政-村居委会",group:"table"},
                    {id:"t0005",text:"名录库-产业活动单位",group:"table"},
                    {id:"t0006",text:"名录库-法人单位",group:"table"},
                    {id:"t0007",text:"市监-登记信息",group:"table"},
                    {id:"t0008",text:"市监-年报信息",group:"table"},
                    {id:"t0009",text:"税务数据",group:"table"},
                ]
            },
            {id:"f02",text:"清查底册",group:"package",children: [
                    {id:"t1001",text:"企业底册",group:"table"},
                    {id:"t1002",text:"个体底册",group:"table"},
                ]}
        ],
        diagrams:[
            {id:"t0001",x:10,y:10,width:90,height:120},
            {id:"t0002",x:110,y:10,width:90,height:120},
            {id:"t0003",x:210,y:10,width:90,height:120},
            {id:"t0004",x:310,y:10,width:90,height:120},
            {id:"t0005",x:410,y:10,width:90,height:120},
            {id:"t0006",x:510,y:210,width:90,height:120},
            {id:"t0007",x:10,y:210,width:90,height:120},
            {id:"t0008",x:110,y:210,width:90,height:120},
            {id:"t0009",x:210,y:210,width:90,height:120},
            {id:"t1001",x:310,y:210,width:90,height:120},
            {id:"t1002",x:410,y:210,width:90,height:120},
        ]
    };
    //
    const {nodes,transitions} = processNodes(model.children,module,file,id,model.diagrams);

    return {
        module,
        folder,
        filePath,
        model,
        tableId:id,
        nodes,transitions
    }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function processNodes(children,module,file,activeId,diagrams:Diagram[]) {
    let nodes:FlowNode[] = [];
    let transitions:Transition[] = [];

    children.forEach((node:TreeNode)=>{
        if(node.group === 'table'){
            const diagram = diagrams.filter(({id})=>id === node.id)[0];

            nodes.push({...diagram,
                id:node.id,
                text:node.text
            });
            node.html = `<a class="${node.id == activeId?'active':''}" href="/common/m-${module}/cdm/design/${file}/viewer/table-${node.id}">${node.text}</a>`;
            node.text = '';
        }else if(node.children){
            const result = processNodes(node.children,module,file,activeId,diagrams);
            nodes = nodes.concat(result.nodes);
            transitions = transitions.concat(result.transitions);
        }
    });

    return {nodes,transitions};
}