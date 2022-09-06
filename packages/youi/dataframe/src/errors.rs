
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SqlError {

    #[error("Only support single query with SELECT statement, got {0}.")]
    SqlQueryNotSupported(String),
}