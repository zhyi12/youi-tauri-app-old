use itertools::Itertools;
use crate::{StepInfo, Result, Column, util};

///
/// 上下连接
///
pub struct Union{
    pub id:String,
    pub name:String,
    pub reader:String,
    pub uri:String,
    pub out_columns:Vec<Column>,
    pub selected_column_names:Vec<String>
}

impl Union {
    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{
        let out_columns:Vec<Column> = step_info.columns.as_ref().unwrap().iter().map(|column|column.clone()).collect();
        let selected_column_names= util::find_selected_columns(step_info);
        Self{
            id:step_info.id.clone(),
            name:step_info.name.clone(),
            reader: String::from(step_info.reader.as_ref().unwrap()),
            uri: step_info.uri.as_ref().unwrap().clone(),
            out_columns,
            selected_column_names
        }
    }
}

impl Union {
    pub fn build(&self)->Result<String>{
        let select_exprs = util::build_select_exprs(&self.out_columns,&self.selected_column_names);
        Ok(format!("union({}(\"{}\").select(exprs([{}])))",self.reader,self.uri,select_exprs))
    }
}

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