use itertools::Itertools;
use crate::{StepInfo, Result};

///
/// 左右连接
///
pub struct Join{
    pub id:String,
    pub name:String,
    pub reader:String,
    pub uri:String,
    pub left_on:Vec<String>,
    pub right_on:Vec<String>,
    pub how:String
}

impl Join {

    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{

        let join_columns = step_info.join_columns.as_ref().unwrap();

        let left_on:Vec<String>  = join_columns.iter().map(|join_column|format!("{}",join_column.left)).collect();
        let right_on:Vec<String> = join_columns.iter().map(|join_column|format!("{}",join_column.right)).collect();

        Self{
            id: format!("{}",step_info.id),
            name: format!("{}",step_info.name),
            uri: format!("{}",step_info.uri.as_ref().unwrap()),
            reader:format!("{}",step_info.reader.as_ref().unwrap()),
            left_on,
            right_on,
            how: format!("{}",step_info.join_how.as_ref().unwrap()),
        }
    }
}

impl Join {
    ///
    ///
    ///
    pub fn build(&self)->Result<String>{
        let reader = format!("{}(\"{}\")",self.reader,self.uri);
        let left_on = self.left_on.iter().join(",");
        let right_on = self.right_on.iter().join(",");
        Ok(format!("join({},\"{}\",\"{}\",\"{}\")",reader,self.how,left_on,right_on))
    }

}