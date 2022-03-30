#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate diesel;
extern crate r2d2;
extern crate dirs;

use std::env;

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, State, Manager};
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};
use tauri_plugin_fs_watch::Watcher;

use diesel::prelude::*;
use diesel::r2d2::ConnectionManager;
use polars_io::prelude::*;
use polars_core::prelude::Result;
use r2d2::Pool;
use serde::Serialize;

use youi_app_config::*;
use youi_app_config::models::AppConfigItem;
use youi_core::json_render::records_to_json;

#[derive(Clone, Serialize)]
struct Payload{
    message:String
}
///app 启动
///
///
fn main() {
    let menu = create_menu();

    tauri::Builder::default()
        .menu(menu)
        .plugin(Watcher::default())
        .plugin(TauriSql::default().add_migrations(
            "sqlite:app-config.db",
            vec![Migration {
                version: 1,
                description: "create todo",
                sql: include_str!("../migrations/app.init.sqlite.sql"),
                kind: MigrationKind::Up,
            }],
        ))
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "config" => {
                    event.window().emit("open-config", Payload { message: "Tauri is awesome!".into() }).unwrap();
                }
                "close" => {
                    event.window().close().unwrap();
                }
                _ => {}
            }
        })
        .setup(|app|{
            let app_dir = tauri::api::path::app_dir(&app.config()).unwrap();

            let database_url = String::from(app_dir.to_str().unwrap())+"/app-config.db";
            //create pool
            let pool = youi_sqlite::create_sqlite_pool(&database_url);
            //创建App配置表
            pool.get().unwrap().execute("CREATE TABLE  IF NOT EXISTS stats_desktop_config (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, value VARCHAR(200) NOT NULL)")
                .expect("create app config table error!");
            //设置tauri::command可用的命令连接池参数
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_config,read_csv])
        .run(tauri::generate_context!())
        .expect("error while running app!");
}

///
///构建菜单
fn create_menu() -> Menu {
    let config = CustomMenuItem::new("config".to_string(), "配置");
    let close = CustomMenuItem::new("close".to_string(), "关闭");
    let submenu = Submenu::new("File", Menu::new().add_item(config).add_item(close));
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    menu
}

//database: tauri::State<'_, Database>
#[tauri::command]
fn load_config(window: tauri::Window<tauri::Wry>, pool:State<'_,Pool<ConnectionManager<SqliteConnection>>>) -> String{
    let conn = pool.get().unwrap();
    let mut records = find_config_list(&conn);

    let version = &window.app_handle().package_info().version.to_string();

    records.push(AppConfigItem {
        id: 0,
        name: "version".to_string(),
        value: String::from(version),
    });
    records_to_json(records)
}

#[tauri::command]
fn read_csv(invoke_message: String) -> String{
    let path = invoke_message;
    let json_str = polars_read_csv(&path);
    json_str.unwrap()
}
///
/// 读取csv文件并输出为json字符串
///
fn polars_read_csv(path:&String) ->Result<String>{
    let df = CsvReader::from_path(path)?
        .has_header(true)
        .finish().expect("csv load error!");

    let mut df = df;

    let mut json_buf = Vec::new();
    //将dataFrame写入Vec
    JsonWriter::new(&mut json_buf).with_json_format(JsonFormat::Json).finish(&mut df).expect("json write error");
    //转换为String对象
    let json_str = String::from_utf8(json_buf).unwrap();

    Ok(json_str)
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}