use crate::util::read_json_file;
use youi_cube::PivotTable;
use youi_dsl::{df_engine,df_cube_execute};


pub fn pivot_query(file_path:&str){

    let pivot_table = read_json_file::<PivotTable>(file_path);

    let script = pivot_table.dsl().unwrap();

    let engine = df_engine();

    let group_names = pivot_table.group_names().unwrap();

    let result = df_cube_execute(&engine,&script,&group_names).unwrap();

    println!("{}",result);


}

pub fn pivot_query_normal(){
    pivot_query("pivot-table.json");
}