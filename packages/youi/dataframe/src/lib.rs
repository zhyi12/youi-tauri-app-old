pub mod lazy;
pub mod column_match;

mod errors;

#[cfg(feature = "sqlite_dataframe")]
pub mod sqlite;
#[cfg(feature = "xls_dataframe")]
mod xls;

pub struct ItemMapping{
    pub name:String,
    pub mapping_name:Option<String>
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}