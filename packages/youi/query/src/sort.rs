use itertools::Itertools;
use crate::{Order, StepInfo,Result};

///
/// 排序
///
pub struct Sort{
    orders:Vec<Order>
}

impl Sort {
    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{
        Self{
            orders:step_info.orders.as_ref().unwrap().iter().map(|o|o.clone()).collect()
        }
    }

}

impl Sort {
    ///
    ///
    ///
    pub fn build(&self) -> Result<String> {
        let reverses = self.orders.iter().map(|order|order.descending.to_string()).join(",");
        let exprs = self.orders.iter().map(|order|format!("col(\"{}\")",&order.property)).join(",");
        Ok(format!("sort_by_exprs(exprs([{}]),\"{}\")",exprs,reverses))
    }

}