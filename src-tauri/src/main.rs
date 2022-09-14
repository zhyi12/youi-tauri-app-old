#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri_plugin_fs_extra::FsExtra;
use tauri_plugin_sql::{TauriSql, Migration, MigrationKind};

const DB_URL: &str = "app.db";

fn main() {

  let context = tauri::generate_context!();

  tauri::Builder::default()
      .plugin(FsExtra::default())
      .plugin(youi_plugin_dsl::init())
      .plugin(TauriSql::default().add_migrations(
    &format!("sqlite:{}",DB_URL),
    vec![Migration {
      version: 1,
      description: "create table",
      sql: include_str!("../migrations/app.init.sqlite.sql"),
      kind: MigrationKind::Up,
    }],
  ))
      .invoke_handler(tauri::generate_handler![close_splashscreen])
      .run(context)
      .expect("error while running tauri application");
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window<tauri::Wry>,username:String,password:String) {
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  let main = window.get_window("main").unwrap();

  //验证登录 username password
  println!("password {}",password);

  //发送app登录消息到前端
  main.emit("app-login",format!("{{\"authorized\":true,\"username\":\"{}\"}}",username)).unwrap();
  main.show().unwrap();
}
