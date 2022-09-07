use std::fs::File;

///
///
///
pub fn read_json_file<T: for<'de> serde::Deserialize<'de>>(path:&str)->T{
    let file_path = format!("{}/data/{}",env!("CARGO_MANIFEST_DIR"),path);

    let file = File::open(&file_path).unwrap();

    serde_json::from_reader::<&File, T>(&file).unwrap()
}