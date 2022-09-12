use youi_query::{StepInfo,build_steps_script};
use youi_dsl::{df_engine,pager_execute};
use crate::util::read_json_file;

///
/// 上下合并
///
fn query(json_path:&str){

    let step_infos = read_json_file::<Vec<StepInfo>>(json_path);

    let script = build_steps_script(&step_infos).unwrap();

    println!("{}",script);

    let engine = df_engine();

    let result = pager_execute(&engine,&script,1,10);
    println!("{:?}",result.unwrap());
}

pub fn query_steps(){
    query("query_steps.json");
}

pub fn query_union(){
    query("query_union.json");
}