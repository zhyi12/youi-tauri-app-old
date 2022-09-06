use crate::errors::EtlError;
use crate::Node;
use crate::node::ScriptBuilder;

///
/// 汇总
///
#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct Agg{
    pub id:String,
    pub from:String
}

impl Agg {

    pub fn from(node:&Node,from:&str)->Self{
        Self{
            id:String::from(&node.id),
            from:String::from(from)
        }
    }
}

impl ScriptBuilder for Agg {

    ///
    ///
    ///
    fn build(&self) -> Result<String, EtlError> {
        Ok(format!("let df_{} = df_{}.agg();\n",self.id,self.from))
    }
}