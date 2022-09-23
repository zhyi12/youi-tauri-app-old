// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use serde::{ser::Serializer, Serialize};
use tauri::{command, plugin::Plugin, Invoke, Runtime};

use std::{fs, path::{Path, PathBuf}, time::{SystemTime, UNIX_EPOCH}};

#[cfg(unix)]
use std::os::unix::fs::{MetadataExt, PermissionsExt};
#[cfg(windows)]
use std::os::windows::fs::MetadataExt;

type Result<T> = std::result::Result<T, Error>;

const NEW_FOLDER_TEXT:&str = "新文件夹";

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
        where
            S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Permissions {
    readonly: bool,
    #[cfg(unix)]
    mode: u32,
}

#[cfg(unix)]
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UnixMetadata {
    dev: u64,
    ino: u64,
    mode: u32,
    nlink: u64,
    uid: u32,
    gid: u32,
    rdev: u64,
    blksize: u64,
    blocks: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Metadata {
    name:String,
    accessed_at_ms: u64,
    created_at_ms: u64,
    modified_at_ms: u64,
    is_dir: bool,
    is_file: bool,
    is_symlink: bool,
    size: u64,
    permissions: Permissions,
    #[cfg(unix)]
    #[serde(flatten)]
    unix: UnixMetadata,
    #[cfg(windows)]
    file_attributes: u32,
}

fn system_time_to_ms(time: std::io::Result<SystemTime>) -> u64 {
    time
        .map(|t| {
            let duration_since_epoch = t.duration_since(UNIX_EPOCH).unwrap();
            duration_since_epoch.as_millis() as u64
        })
        .unwrap_or_default()
}

#[command]
async fn metadata(path: PathBuf) -> Result<Metadata> {
    parse_metadata(path.as_path())
}

#[command]
async fn metadatas(path: PathBuf) -> Result<Vec<Metadata>> {
    Ok(walkdir::WalkDir::new(path)
        .min_depth(1)
        .max_depth(1)
        .contents_first(false).into_iter()
        .filter_entry(|f|!f.path().file_name().unwrap().to_str().unwrap().starts_with("."))
        .map(|f|{
        parse_metadata(f.as_ref().unwrap().path()).unwrap()
    }).collect::<Vec<Metadata>>())
}

///
/// 读取文本格式文件字符
///
#[command]
async fn read_file(path: PathBuf) -> Result<String> {
    Ok(std::fs::read_to_string(path).unwrap_or(format!("{{\"error\":\"文件读取异常.\"}}")))
}

///
/// 保存文件
///
#[command]
async fn save_file(path: PathBuf,content:String) ->Result<Metadata>{
    fs::write(&path,content).unwrap();
    parse_metadata(path.as_path())
}
///
///
///
#[command]
async fn new_folder(path: PathBuf) -> Result<Metadata> {
    let mut folder_path = path.join(NEW_FOLDER_TEXT);
    if folder_path.exists(){
        folder_path = new_folder_path(&path,1);
    }
    //创建文件夹
    fs::create_dir(&folder_path).unwrap();

    parse_metadata(folder_path.as_path())
}

///
/// 路径文件或文件夹是否存在
///
#[command]
async fn exists(path: PathBuf) -> bool {
    path.exists()
}
///
/// 重命名
///
#[command]
async fn rename(folder:PathBuf,name:String,new_name:String)-> Result<Metadata>{
    let new_path = folder.join(&new_name);

    if new_path.exists(){
        //新路径已经存在
        parse_metadata(folder.join(&name).as_path())
    }else {
        fs::rename(&folder.join(&name),&new_path).unwrap();
        parse_metadata(new_path.as_path())
    }
}

/// Tauri plugin.
pub struct FsExtra<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> Default for FsExtra<R> {
    fn default() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![exists, metadata,metadatas,read_file,new_folder,save_file,rename]),
        }
    }
}

impl<R: Runtime> Plugin<R> for FsExtra<R> {
    fn name(&self) -> &'static str {
        "fs-extra"
    }

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}

fn parse_metadata(path: &Path)->Result<Metadata>{
    let metadata = std::fs::metadata(path)?;
    let file_type = metadata.file_type();
    let permissions = metadata.permissions();
    Ok(Metadata {
        name:String::from(path.file_name().unwrap().to_str().unwrap()),
        accessed_at_ms: system_time_to_ms(metadata.accessed()),
        created_at_ms: system_time_to_ms(metadata.created()),
        modified_at_ms: system_time_to_ms(metadata.modified()),
        is_dir: file_type.is_dir(),
        is_file: file_type.is_file(),
        is_symlink: file_type.is_symlink(),
        size: metadata.len(),
        permissions: Permissions {
            readonly: permissions.readonly(),
            #[cfg(unix)]
            mode: permissions.mode(),
        },
        #[cfg(unix)]
        unix: UnixMetadata {
            dev: metadata.dev(),
            ino: metadata.ino(),
            mode: metadata.mode(),
            nlink: metadata.nlink(),
            uid: metadata.uid(),
            gid: metadata.gid(),
            rdev: metadata.rdev(),
            blksize: metadata.blksize(),
            blocks: metadata.blocks(),
        },
        #[cfg(windows)]
        file_attributes: metadata.file_attributes(),
    })
}

///
/// 寻找本地创建新文件夹的路径
///
fn new_folder_path(path: &PathBuf,postfix:usize)->PathBuf{
    let folder_path = path.join(format!("{}{}",NEW_FOLDER_TEXT,postfix));
    if folder_path.exists(){
        new_folder_path(path,postfix+1)
    }else{
        folder_path
    }
}
