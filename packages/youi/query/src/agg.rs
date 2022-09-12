use itertools::Itertools;
use crate::{MeasureItem, Result,StepInfo};

pub struct Agg{
    ///
    /// 分组字段
    /// 
    pub groupby:Vec<String>,
    ///
    /// 计量字段
    /// 
    pub measure_items:Vec<MeasureItem>
    
}

impl Agg {
    
    ///
    ///
    ///
    pub fn from(step_info:&StepInfo)->Self{
        //TODO 异常处理
        let groupby:Vec<String> = step_info.groups.as_ref().unwrap()
            .iter().map(|group|format!("{}",group.name)).collect();

        let measure_items:Vec<MeasureItem> = step_info.measure_items.as_ref().unwrap()
            .iter().map(|item|item.clone()).collect();

        Agg{
            groupby,
            measure_items
        }
    }
}

impl Agg {
    ///
    ///
    ///
    pub fn build(&self)->Result<String>{
        let by = self.groupby.iter().join(",");
        let exprs = self.measure_items.iter()
            .map(|item|{
                let aggregate = item.aggregate.as_ref().unwrap_or(&String::from("sum")).to_string();
                format!("col(\"{}\").{}().alias(\"{}_{}\")",item.name,aggregate,item.name,aggregate)
            }).join(",");
        Ok(format!("agg(\"{}\",exprs([{}]))",by,exprs))
    }
}
