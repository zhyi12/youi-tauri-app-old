use walkdir::{WalkDir};
use walkdir::DirEntry;

///
///获取csv文件路径集合
///
pub fn walk_csv_file(dir: &String) -> Result<String,walkdir::Error>{

    let mut paths = Vec::new();

    let walker = WalkDir::new(dir).into_iter();
    for entry in walker.filter_entry(|e| !is_hidden(e)) {
        //let path = entry.unwrap().path().to_str().unwrap();
        let mut path = String::from(entry?.path().to_str().unwrap());
        path = path.replace(dir,"");
        if !path.is_empty() {
            paths.push(path);
        }
    }

    let json_str = serde_json::to_string(&paths);

    Ok(json_str.unwrap())
}
///
///
///
fn is_hidden(entry: &DirEntry) -> bool {
    entry.file_name()
        .to_str()
        .map(|s| s.starts_with(".") ||(entry.path().is_file() && s.ends_with("\\.csv")) )
        .unwrap_or(false)
}