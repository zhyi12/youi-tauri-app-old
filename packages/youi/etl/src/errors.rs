use thiserror::Error;

#[derive(Error, Debug)]
pub enum EtlError {

    #[error("error node {0}.")]
    ErrorNode(String),

}