
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CubeError {

    #[error("parse cube {0}.")]
    ParseError(String),

}