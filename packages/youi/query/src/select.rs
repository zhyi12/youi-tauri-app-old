use crate::{StepInfo, Result, Column, util};

pub struct Select{
    pub id:String,
    pub name:String,
    pub columns:Vec<Column>,
    pub selected_column_names:Vec<String>
}

impl Select {

    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{
        let columns:Vec<Column> = step_info.columns.as_ref().unwrap().iter().map(|column|column.clone()).collect();
        let selected_column_names= util::find_selected_columns(step_info);

        Self{
            id:step_info.id.clone(),
            name:step_info.name.clone(),
            selected_column_names,
            columns
        }
    }
}

impl Select {

    ///
    ///
    ///
    pub fn build(&self)->Result<String>{
        let select_exprs = util::build_select_exprs(&self.columns,&self.selected_column_names);
        Ok(format!("select(exprs([{}]))",select_exprs))
    }
}