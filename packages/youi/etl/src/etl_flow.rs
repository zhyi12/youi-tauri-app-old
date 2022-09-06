use std::collections::{HashMap};
use petgraph::prelude::NodeIndex;
use petgraph::visit::{NodeIndexable, Topo};

use crate::dag::Dag;
use crate::{Flow,Node,Transition};
use crate::errors::EtlError;
use crate::node::FlowNode;

///
///
///
pub fn run(flow: &Flow) ->Result<(),EtlError>{

    let mut node_map = std::collections::HashMap::with_capacity(flow.nodes.len());

    flow.nodes.iter().for_each(|node| {
        node_map.insert(node.id.to_owned(), node.clone());
    });
    //启动节点
    let start_node = node_map.get("start");

    if start_node.is_some() {
        //有向无环图
        let mut dag = Dag::<Node, Transition>::new();
        let root: NodeIndex = dag.add_node(start_node.unwrap().clone());
        let mut ids:HashMap<String,usize> = HashMap::new();
        //迭代处理子节点，加入节点到有向无环图，并返回end节点
        let _end = process_nodes_dag(&mut dag, &flow, &node_map, &root, "start",&mut ids);

        //拓扑排序
        let mut topo = Topo::new(&dag.graph());

        //拓扑遍历
        let mut next = topo.next(&dag.graph());
        
        let mut scripts = String::new();

        while next.is_some(){
            let node_index = next.unwrap();
            //etl流程节点
            let flow_node = FlowNode::from(&dag,node_index);
            //流程脚本
            let script = flow_node.build()?;
            scripts.push_str(&script);
            //下一个节点
            next = topo.next(&dag.graph());
        }

        println!("{}",scripts);
    }

    Ok(())
}

///
/// 迭代处理节点，构建有向无环图
///
fn process_nodes_dag(dag: &mut Dag<Node, Transition>, flow: &Flow, node_map: &HashMap<String, Node>, parent: &NodeIndex, parent_id: &str,
                     ids:&mut HashMap<String,usize>) -> Option<NodeIndex>{

    let mut end:Option<NodeIndex> = None;
    flow.transitions.iter()
        .filter(|t|t.from.as_str() == parent_id).for_each(|transition| {
        //
        let node = node_map.get(transition.to.as_str()).unwrap();
        //
        let key = String::from(node.id.as_str());

        if !ids.contains_key(&key){
            //图中不存在的节点，创建并加入图中
            let (_, child_node_index) = dag.add_child(*parent, transition.clone(), node.clone());
            ids.insert(key,child_node_index.index());

            if node.id.as_str() == "end"{
                end = Some(child_node_index);
            }else{
                let _end = process_nodes_dag(dag, flow, node_map, &child_node_index, node.id.as_str(),ids);
                if _end.is_some(){
                    end = _end;
                }
            }
        }else{
            //已经在图中的节点，新增edge
            let idx = dag.from_index(*ids.get(&key).unwrap());
            dag.add_edge(*parent,idx,transition.clone()).unwrap();
        }
    });

    end
}