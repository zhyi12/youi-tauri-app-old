#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri_plugin_fs_extra::FsExtra;
use tauri_plugin_sql::{TauriSql, Migration, MigrationKind};

const DB_URL: &str = "app.db";

fn main() {
  tauri::Builder::default()
      .plugin(FsExtra::default())
      .plugin(TauriSql::default().add_migrations(
    &format!("sqlite:{}",DB_URL),
    vec![Migration {
      version: 1,
      description: "create table",
      sql: include_str!("../migrations/app.init.sqlite.sql"),
      kind: MigrationKind::Up,
    }],
  ))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
