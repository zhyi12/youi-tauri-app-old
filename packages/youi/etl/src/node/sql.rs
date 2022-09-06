use crate::{find_node_param_value, Node};
use crate::errors::EtlError;

#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct ReadSql{
    id:String,
    connect:String,
    sql:String
}


impl ReadSql {
    ///
    ///
    ///
    pub fn from(node:&Node)->Self{
        let connect = find_node_param_value(node,"connect");
        let sql = find_node_param_value(node,"sql");
        Self{
            id:String::from(&node.id),
            connect,
            sql,
        }
    }
}

#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct WriteSql{
    id:String,
    from:String,
    connect:String,
    table_name:String
}

impl WriteSql {
    ///
    ///
    ///
    pub fn from(node:&Node,parent_node:&Node)->Self{
        let connect = find_node_param_value(node,"connect");
        let table_name = find_node_param_value(node,"tableName");
        Self{
            id:String::from(&node.id),
            from:String::from(&parent_node.id),
            connect,
            table_name,
        }
    }
}

impl WriteSql {

    ///
    ///
    ///
    pub fn build(&self) ->Result<String,EtlError>{

        Ok(String::from(""))
    }
}