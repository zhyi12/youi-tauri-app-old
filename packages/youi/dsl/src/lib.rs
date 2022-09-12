extern crate rhai;
extern crate polars_core;
extern crate polars_lazy;
extern crate polars_io;

use polars_core::prelude::DataFrame;
use polars_io::prelude::{JsonWriter,JsonFormat};
use rhai::{Engine, EvalAltResult, exported_module};
use youi_dataframe::lazy::JsLazyFrame;
use crate::polars_io::SerWriter;

mod transform;
mod dataframe;

///
/// 领域脚本执行及返回
///
pub fn default_df_execute(script:&str)->Result<String, Box<EvalAltResult>>{
    let engine = df_engine();
    df_execute(&engine,script)
}
///
///
///
pub fn df_execute(engine:&Engine,script:&str)->Result<String, Box<EvalAltResult>>{
    //转换为可执行脚本
    let exec_script = transform::transform(script);

    let result = df_eval(&engine,&exec_script)?;

    let df = result.df.collect().unwrap();

    let json_str = df_to_json(df);

    Ok(json_str)
}


///
/// 分页查询
///
pub fn pager_execute(engine:&Engine,script:&str,page_index:usize,page_size:usize)->Result<String, Box<EvalAltResult>>{

    let exec_script = transform::transform(script);

    let result = df_eval(&engine,&exec_script)?;

    let offset = ((page_index-1).max(0) * page_size) as i64;
    let rdf = result.df.clone().slice(offset,page_size as u32).collect();

    match rdf {
        Ok(df) => {
            let total = result.df.collect().unwrap().height();
            let json_str = df_to_json(df);
            Ok(format!("{{\"total\":{},\"records\":{}}}",total,json_str))
        }
        Err(_) => {
            Ok(format!("{{\"message\":{{\"code\":999999}},\"total\":0,\"records\":[]}}"))
        }
    }
}

///
///
///
pub fn df_engine()->Engine{
    let mut engine = Engine::new();

    let module = exported_module!(dataframe::ds_module);

    engine.set_max_expr_depths(0,0);
    engine.register_global_module(module.into());

    engine
}
///
/// 执行脚本
///
fn df_eval(engine:&Engine,exec_script:&str)->Result<JsLazyFrame, Box<EvalAltResult>>{
    engine.eval(&exec_script)
}
///
/// 序列化为json格式
///
pub fn df_to_json(mut df:DataFrame)->String{
    let mut json_buf = Vec::new();
    //将dataFrame写入Vec
    JsonWriter::new(&mut json_buf).with_json_format(JsonFormat::Json)
        .finish(&mut df).expect("json write error");
    //转换为String对象
    let json_str = String::from_utf8(json_buf).unwrap();
    json_str
}

#[cfg(test)]
mod tests {
    use crate::{df_engine, df_execute};

    #[test]
    fn transform_script() {
        let script = "let df = read_csv(\"/Volumes/D/data/0101.csv\")\
        .select(exprs([col(\"社会信用代码\"),col(\"详细名称\")])); df";

        let result = df_execute(&df_engine(),script);

        println!("{}",result.unwrap());

    }
}