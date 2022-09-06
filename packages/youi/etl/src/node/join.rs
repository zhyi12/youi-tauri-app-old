use crate::errors::EtlError;
use crate::Node;

///
/// 上下合并
///
#[derive(Eq, PartialEq, Clone, Debug, Hash)]
pub struct Union{
    pub id:String,
    pub left:String,
    pub right:String
}

impl Union {

    pub fn from(node:&Node,left:&str,right:&str)->Self{
        Self{
            id:String::from(&node.id),
            left:String::from(left),
            right:String::from(right)
        }
    }

}

impl Union {
    ///
    ///
    ///
    pub fn build(&self)->Result<String,EtlError>{
        Ok(format!("let df_{} = df_{}.concat(df_{});\n",self.id,self.left,self.right))
    }
}