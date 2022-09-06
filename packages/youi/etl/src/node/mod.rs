use petgraph::prelude::NodeIndex;
use petgraph::visit::Walker;
use crate::dag::Dag;
use crate::errors::EtlError;
use crate::{Node,Transition};

pub mod agg;
pub mod csv;
pub mod join;
pub mod sql;
pub mod filter;


pub trait ScriptBuilder{
    fn build(&self)->Result<String,EtlError>{
        Ok(String::new())
    }
}

///
///
///
#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub enum FlowNode {
    Start(Start),
    ReadCsv(csv::ReadCsv),
    Union(join::Union),
    Agg(agg::Agg),
    ReadSql(sql::ReadSql),
    WriteCsv(csv::WriteCsv),
    WriteSql(sql::WriteSql),
    Dummy,
    End(End),
}

impl FlowNode {
    pub fn from(dag:&Dag::<Node, Transition>,node_index:NodeIndex)->Self{
        let node = &dag[node_index];
        let mut flow_node = FlowNode::Dummy;
        match node.node_type.as_str() {
            "start"=>{
                flow_node= FlowNode::Start(Start::new());
            }
            "read_csv"=>{
                flow_node= FlowNode::ReadCsv(csv::ReadCsv::from(node));
            }
            "read_sql"=>{
                flow_node= FlowNode::ReadSql(sql::ReadSql::from(node));
            }
            "write_csv"=>{
                let (_,parent_index) = dag.parents(node_index).iter(&dag).next().unwrap();
                let parent_node = &dag[parent_index];
                flow_node = FlowNode::WriteCsv(csv::WriteCsv::from(&node,parent_node));
            }
            "write_sql"=>{
                let (_,parent_index) = dag.parents(node_index).iter(&dag).next().unwrap();
                let parent_node = &dag[parent_index];
                flow_node= FlowNode::WriteSql(sql::WriteSql::from(node,&parent_node));
            }
            "union"=>{
                let mut parents_iter = dag.parents(node_index).iter(&dag);
                let (_,main_index) = parents_iter.next().unwrap();
                let (_,union_index) = parents_iter.next().unwrap();
                flow_node = FlowNode::Union(join::Union::from(node,&dag[main_index].id,&dag[union_index].id));
            },
            "agg"=>{
                let (_,parent_index) = dag.parents(node_index).iter(&dag).next().unwrap();
                flow_node = FlowNode::Agg(agg::Agg::from(node,&dag[parent_index].id));
            }
            "end"=>{
                let (_,parent_index) = dag.parents(node_index).iter(&dag).next().unwrap();
                flow_node = FlowNode::End(End::new(&dag[parent_index].id));
            }
            _=>{}
        }

        flow_node
    }
}

impl FlowNode {

    ///
    /// 生成节点脚本
    ///
    pub(crate) fn build(&self) -> Result<String,EtlError> {

        match self {
            FlowNode::ReadCsv(x)=>{
                script_build(x)
            }
            FlowNode::Union(x)=>{
                x.build()
            }
            FlowNode::Agg(x)=>{
                script_build(x)
            }
            FlowNode::WriteCsv(x) => {
                x.build()
            }
            FlowNode::WriteSql(x) => {
                x.build()
            }
            FlowNode::End(e) => {
                Ok(format!("df_{}",e.from))
            }
            _=>{
                Ok(String::from(""))
            }
        }
    }
}

impl From<Start> for FlowNode {
    fn from(x: Start) -> Self {
        FlowNode::Start(x)
    }
}

impl From<End> for FlowNode {
    fn from(x: End) -> Self {
        FlowNode::End(x)
    }
}


#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct Start{}

impl Start {
    pub fn new()->Self{
        Self{}
    }
}

#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct End{
    from:String
}

impl End {
    pub fn new(from:&str)->Self{
        Self{
            from:String::from(from)
        }
    }
}

///
///
///
fn script_build(builder:&dyn ScriptBuilder)->Result<String,EtlError> {
    builder.build()
}
