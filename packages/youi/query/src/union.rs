use std::collections::HashMap;
use itertools::Itertools;
use crate::{StepInfo, Result, Column, Reader};

///
/// 上下连接
///
pub struct Union{
    pub id:String,
    pub name:String,
    ///
    /// 输入列
    ///
    pub columns:Vec<Column>,
    ///
    /// 上下连接的数据
    ///
    pub unions:Vec<Reader>,
}

impl Union {
    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{
        let columns:Vec<Column> = step_info.columns.as_ref().unwrap().iter().map(|column|column.clone()).collect();
        let unions:Vec<Reader> = step_info.unions.as_ref().unwrap().iter().map(|reader|reader.clone()).collect();
        Self{
            id:step_info.id.clone(),
            name:step_info.name.clone(),
            columns,
            unions,
        }
    }
}

impl Union {
    pub fn build(&self)->Result<String>{
        //合并后的输出列
        let mut merged_columns:Vec<Column> = self.columns.iter().map(|column|column.clone()).collect();
        //合并后的列名
        let mut merged_names:Vec<String> = merged_columns.iter().map(|column|format!("{}",column.name)).collect();

        //遍历unions合并列
        for idx in 0..self.unions.len(){
            let _ = &self.unions[idx].columns.iter()
                .filter(|column|!merged_names.contains(&column.name.clone()))
                .for_each(|column|{
                    merged_columns.push(column.clone());
                });

            merged_names = merged_columns.iter().map(|column|format!("{}",column.name)).collect()
        }

        let mut select_script = String::new();

        select_script.push_str("select(exprs([col(\"*\"),");
        select_script.push_str(&(self.columns.len()..merged_columns.len()).map(|idx|{
            format!("lit(\"\").alias(\"{}\")",merged_columns[idx].name)
        }).join(","));
        select_script.push_str("]))");

        let mut union_scripts:Vec<String> = Vec::new();
        //生成union项的reader和select
        for idx in 0..self.unions.len(){
            let union = &self.unions[idx];
            let mut union_column_map:HashMap<String,usize> = HashMap::new();
            for col_index in 0..union.columns.len(){
                let column = &union.columns[col_index];
                union_column_map.insert(format!("{}",column.name),col_index);
            }
            //
            let exprs = merged_columns.iter().map(|column|{
                let key = column.name.to_string();
                if union_column_map.contains_key(&key){
                    //
                    format!("col(\"{}\")",key)
                }else{
                    format!("lit(\"\").alias(\"{}\")",key)
                }
            }).join(",");

            union_scripts.push(format!("\n        {}(\"{}\")\n          .select(exprs([{}]))",union.name,union.uri,exprs));
        }

        let union_param = union_scripts.iter().join(",");

        Ok(format!("{}\n    .concat([{}\n    ])",select_script,union_param))
    }
}