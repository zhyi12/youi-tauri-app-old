use itertools::Itertools;
use crate::{Column, StepInfo};

///
/// 获取选择列名集合
///
pub fn find_selected_columns(step_info:&StepInfo) ->Vec<String>{
    let selected_column_names;//选择的列，如果为空，则全选
    if step_info.selected_column_names.is_some(){
        selected_column_names = step_info.selected_column_names.as_ref().unwrap().iter().map(|name|name.clone()).collect::<Vec<String>>();
    }else{
        selected_column_names = vec![];
    }
    selected_column_names
}

///
///
///
pub fn build_select_exprs(columns:&Vec<Column>,selected_column_names:&Vec<String>)->String{
    let select_exprs = columns.iter()
        .filter(|column|selected_column_names.len()==0 || selected_column_names.contains(&column.name))
        .map(|column|{
            let mut alias_expr = String::new();
            if column.alias.is_some(){
                alias_expr = format!(".alias(\"{}\")",column.alias.as_ref().unwrap());
            }
            format!("col(\"{}\"){}",column.name,alias_expr)
        }).join(",");

    select_exprs
}

///
///
///
pub fn build_lit(value:&str,data_type:&str)->String{
    let wrap = match data_type {
        "str"=>"\"",
        _=>""
    };
    format!("lit({}{}{})",wrap,value,wrap)
}