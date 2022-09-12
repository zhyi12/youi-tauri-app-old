use rhai::{Engine};
use youi_dsl::{df_engine, df_execute, pager_execute};
use youi_query::{json_to_script};
use tauri::{plugin::{Builder, TauriPlugin}, Manager, Runtime, State, Error};

struct ShareEngine{
    engine:Engine
}

unsafe impl Send for ShareEngine{}

unsafe impl Sync for ShareEngine{}

///
/// 执行 dsl 脚本，返回结果数据集
///
#[tauri::command]
async fn execute(engine_instance: State<'_,ShareEngine>,script:String) ->Result<String,Error>{
    dsl_execute(&engine_instance.engine,&script)
}

///
/// 根据标准的查询json，转换为dsl脚本并执行，返回结果数据集
///
#[tauri::command]
async fn query(engine_instance: State<'_,ShareEngine>,query:String,page_index:usize,page_size:usize) ->Result<String,Error>{
    let result = json_to_script(&query);
    match result{
        Ok(script) => {
            Ok(pager_execute(&engine_instance.engine,&script,page_index,page_size).unwrap_or(String::from("{}")))
        }
        Err(_) => {
            Ok(String::from("[{error:\"query parse error\"}]"))
        }
    }
}

#[tauri::command]
async fn query_to_script(query:String) ->Result<String,Error>{
    let result = json_to_script(&query);
    match result{
        Ok(script) => {
            Ok(script)
        }
        Err(_) => {
            Ok(String::from("[{error:\"query parse error\"}]"))
        }
    }
}

///
///  dsl 脚本执行
///
fn dsl_execute(engine:&Engine,script:&str)->Result<String,Error>{
    let result = df_execute(engine,script);
    match result {
        Ok(json_str) => {
            Ok(json_str)
        }
        Err(_) => {
            Ok(String::from("[{error:1}]"))
        }
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("dsl")
        .invoke_handler(tauri::generate_handler![execute,query,query_to_script])
        .setup(|app_handle| {
            app_handle.manage(ShareEngine{engine:df_engine()});
            Ok(())
        })
        .build()
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}