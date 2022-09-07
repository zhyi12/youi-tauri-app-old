use youi_query::{StepInfo,build_steps_script};
use crate::util::read_json_file;

///
/// 上下合并
///
fn query(json_path:&str){

    let step_infos = read_json_file::<Vec<StepInfo>>(json_path);

    let script = build_steps_script(&step_infos).unwrap();

    println!("{}",script);

    // let result = stats_dsl::defalut_df_execute(&script);
    // println!("{:?}",result.unwrap());
}

pub fn query_steps(){
    query("query_steps.json");
}