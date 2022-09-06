
use thiserror::Error;

#[derive(Error, Debug)]
pub enum QueryError {

    #[error("error step {0}.")]
    ErrorStep(String),

}