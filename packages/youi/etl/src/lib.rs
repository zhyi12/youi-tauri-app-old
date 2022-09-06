pub mod dag;
pub mod etl_flow;
mod node;
mod errors;

use serde::{Serialize,Deserialize};
///
///
///
pub enum NodeType{
    Start,
    CsvReader,
    Union
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Flow {
    nodes: Vec<Node>,
    transitions: Vec<Transition>,
}

///
/// 节点
///
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub text: String,
    pub node_type: String,
    pub params: Option<Vec<Param>>,
    pub inputs: Option<Vec<DataColumn>>,
    pub outputs: Option<Vec<DataColumn>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Param {
    pub name: String,
    pub value: String,
    pub data_type: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DataColumn {
    name: String,
    alias: Option<String>,
    data_type: Option<String>,
    params: Option<Vec<Param>>,
}

///
/// 连接
///
#[derive(Clone, Debug, Serialize, Deserialize,PartialEq)]
pub struct Transition {
    id: String,
    from: String,
    to: String,
    condition:Option<String>
}

///
/// 获取节点配置的参数值
///
pub fn find_node_param_value(node:&Node,name:&str)->String{
    let param_path = node.params.as_ref().unwrap().iter()
        .filter(|p|p.name.as_str() == name)
        .map(|p|String::from(&p.value))
        .find(|_|true);

    if param_path.is_some(){
        param_path.unwrap()
    }else {
        String::new()
    }
}