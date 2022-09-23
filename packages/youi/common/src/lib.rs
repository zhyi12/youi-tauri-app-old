use serde::{ser::Serializer, Serialize};

///
///
///
#[derive(Serialize)]
pub struct Message{
    code:String,
    message:String
}

///
///
///
#[derive(Serialize)]
pub struct ResContext<T>{
    total:Option<usize>,
    record:Option<T>,
    records:Option<Vec<T>>,
    message:Option<Message>
}
