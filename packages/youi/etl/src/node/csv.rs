use fehler::throw;
use crate::{Node, find_node_param_value};
use crate::errors::EtlError;
use crate::node::ScriptBuilder;

#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct ReadCsv{
    pub id:String,
    pub path:String
}

impl ReadCsv {
    ///
    ///
    ///
    pub fn from(node:&Node)->Self{

        let path = find_node_param_value(node,"path");

        Self{
            id:String::from(&node.id),
            path
        }
    }
}

impl ScriptBuilder for ReadCsv {
    ///
    ///
    ///
    fn build(&self)->Result<String,EtlError>{
        if self.path.as_str() == ""{
            throw!(EtlError::ErrorNode(String::from("请设置path参数")));
        }
        Ok(format!("let df_{} = read_csv(\"{}\");\n",self.id,self.path))
    }
}

#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct WriteCsv{
    pub from:String,
    pub path:String
}

impl WriteCsv {
    ///
    ///
    ///
    pub fn from(node:&Node,parent_node:&Node)->Self{
        let path = find_node_param_value(node,"path");
        Self{
            from:String::from(&parent_node.id),
            path
        }
    }
}

impl WriteCsv {

    ///
    ///
    ///
    pub fn build(&self) ->Result<String,EtlError>{
        Ok(format!("df_{}.write_csv(\"{}\");\n",self.from,self.path))
    }
}


