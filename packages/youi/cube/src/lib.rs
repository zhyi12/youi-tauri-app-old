use itertools::Itertools;
use serde::{Serialize,Deserialize};

mod errors;

///
///
///
pub type Result<T> = std::result::Result<T, errors::CubeError>;

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Column{
    pub id:String,
    pub name:String,
    pub text:String,
    pub data_type:String
}

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
pub struct MeasureItem{
    pub id:String,
    pub name:String,
    pub text:String,
    pub aggregate:String
}

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item{
    pub id:String,
    pub name:String,
    pub text:String,
    pub data_type:String
}

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
pub struct Dimension{
    pub id:String,
    pub name:String,
    pub text:String,
    pub items:Vec<Item>
}

///
/// 透视表
///
#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PivotTable{
    pub reader:String,
    pub uri:String,
    pub columns:Vec<Column>,
    pub measure_items:Vec<MeasureItem>,
    pub row_dimensions:Vec<Dimension>,
    pub col_dimensions:Vec<Dimension>,
}

impl PivotTable {

    pub fn from(json:&str)->Self{
        //TODO 异常处理
        serde_json::from_str::<PivotTable>(json).unwrap()
    }

}

impl PivotTable {

    ///
    /// 生成 dsl 脚本
    ///
    pub fn dsl(&self)->Result<String>{
        let select_exprs = self.columns.iter().map(|column|format!("col(\"{}\")",column.name)).join(",");

        let row_by = &self.row_dimensions.iter().map(|dimension|{
            format!("{}",dimension.name)
        }).join(",");

        let col_by = &self.col_dimensions.iter().map(|dimension|{
            format!("{}",dimension.name)
        }).join(",");
        //group by
        let by = vec![row_by,col_by].iter().filter(|s|!s.is_empty()).join(",");
        //
        let measure_exprs = &self.measure_items.iter().map(|item|{
            format!("col(\"{}\").{}().alias(\"{}_{}\")",item.name,item.aggregate,item.name,item.aggregate)
        }).join(",");

        Ok(format!("{}(\"{}\").select(exprs([{}])).agg(\"{}\",exprs([{}]))",
                   self.reader,self.uri,select_exprs,by,measure_exprs))
    }

    ///
    ///
    ///
    pub fn group_names(&self)->Result<Vec<String>>{
        let mut group_names = vec![];

        let _= &self.row_dimensions.iter().for_each(|dimension|{
            group_names.push(String::from(&dimension.name))
        });

        let _= &self.col_dimensions.iter().for_each(|dimension|{
            group_names.push(String::from(&dimension.name))
        });

        Ok(group_names)
    }
}