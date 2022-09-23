use std::fs;

pub mod util;
pub mod query_case;
pub mod pivot_table_case;

fn main(){

    // //测试多查询步骤生成脚本
    // query_case::query_union();

    //透视表查询
    //pivot_table_case::pivot_query_normal();

    fs::rename("/Volumes/D/youi-app-data/我的数据/新文件夹","文件夹1").unwrap();
}