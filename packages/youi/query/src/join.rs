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
    pub uri:String,
    pub out_columns:Vec<Column>,
    pub selected_column_names:Vec<String>,
    pub left_on:Vec<String>,
    pub right_on:Vec<String>,
    pub how:String
}