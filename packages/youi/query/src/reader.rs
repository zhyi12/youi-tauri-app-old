use crate::{StepInfo,Result,Column,util};

pub struct Reader{
    pub id:String,
    pub name:String,
    pub reader:String,
    pub uri:String,
    pub columns:Vec<Column>,
    pub selected_column_names:Vec<String>
}

impl Reader {

    pub fn from(step_info:&StepInfo)->Self{
        let columns:Vec<Column> = step_info.columns.as_ref().or(Some(&Vec::<Column>::with_capacity(0))).unwrap().iter().map(|column|column.clone()).collect();
        let selected_column_names= util::find_selected_columns(step_info);
        Self{
            id:step_info.id.clone(),
            name:step_info.name.clone(),
            reader: String::from(step_info.reader.as_ref().unwrap()),
            uri: step_info.uri.as_ref().unwrap().clone(),
            columns,
            selected_column_names
        }
    }
}

impl Reader {

    pub fn build(&self)->Result<String>{
        if self.columns.len()>0{
            let select_exprs = util::build_select_exprs(&self.columns,&self.selected_column_names);
            Ok(format!("{}(\"{}\").select(exprs([{}]))",self.reader,self.uri,select_exprs))
        }else{
            Ok(format!("{}(\"{}\")",self.reader,self.uri))
        }
    }
}