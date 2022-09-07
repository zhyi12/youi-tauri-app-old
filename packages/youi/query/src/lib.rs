// This file is part of youi-rust-framework.

// Copyright (C) 2017-2022 youi
// License: Apache-2.0

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! #自助数据查询脚本生成
//! ## Step::Reader
//! 读取数据
//! ## Step::Select
//! 列选择
//! ## Step::Filter
//! 数据过滤
//! ## Step::Calculator
//! 计算列
//! ## Step::Union
//! 上下合并
//! ## Step::Join
//! 左右合并
//! ## Step::Agg
//! 数据汇总
//!
//!

mod select;
mod agg;
mod filter;
mod errors;
mod reader;
mod util;
mod join;
mod calculator;
mod sort;

use serde::{Serialize,Deserialize};
use itertools::Itertools;

pub type Result<T> = std::result::Result<T, errors::QueryError>;

///
/// 步骤信息
///
#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepInfo {
    ///
    /// 步骤唯一标志
    ///
    pub id: String,
    ///
    /// 步骤名
    ///
    pub name: String,
    ///
    /// 数据读取器，包括 read_csv read_sql等
    ///
    pub reader: Option<String>,
    ///
    /// 数据读取uri路径
    ///
    pub uri: Option<String>,
    ///
    /// 步骤中文描述信息
    ///
    pub text: Option<String>,
    ///
    /// 列信息集合
    ///
    pub columns: Option<Vec<Column>>,
    ///
    /// 选择的列信息
    ///
    pub selected_column_names: Option<Vec<String>>,
    ///
    /// 有序查询条件集合，可根据level属性转树型结构
    ///
    pub conditions:Option<Vec<Condition>>,
    ///
    /// 排序集合
    ///
    pub orders:Option<Vec<Order>>,
    ///
    /// join 连接方式
    ///
    pub join_how: Option<String>,
    ///
    /// join 列集合
    ///
    pub join_columns:Option<Vec<JoinColumn>>,
    // groups?:Array<any>,
    // measureItems?:Array<any>,
    // addedColumn?:any,
}

///
/// 列信息
///
#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
pub struct Column {
    pub name: String,
    pub text: String,
    pub data_type: Option<String>,
    pub alias: Option<String>,
}

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
pub struct JoinColumn{
    pub left:String,
    pub right:String,
    pub name:String,
    pub data_type: Option<String>,
}

///
/// 查询条件
///
#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Condition{
    pub id: String,
    pub name:Option<String>,
    pub property: Option<String>,
    pub text: Option<String>,
    pub operator:Option<String>,
    pub value:Option<String>,
    pub data_type:Option<String>,
    pub level: Option<usize>
}

#[derive(Clone, Debug, Hash,Serialize,Deserialize)]
pub struct Order{
    pub property:String,
    pub descending:bool
}

///
/// 查询步骤
///
pub enum Step {
    /// 数据读取
    Reader(reader::Reader),
    /// 列选择
    Select(select::Select),
    /// 汇总
    Agg(agg::Agg),
    /// 过滤
    Filter(filter::Filter),
    /// 上下连接
    Union(join::Union),
    /// 左右连接
    Join(join::Join),
    /// 排序
    Sort(sort::Sort),
    /// 计算列
    Calculator(calculator::Calculator),
    /// 空步骤
    Empty,
}

impl Step {
    ///
    ///
    ///
    pub fn from(step_info: &StepInfo) -> Self {
        match step_info.name.as_str() {
            "reader" => Step::Reader(reader::Reader::from(&step_info)),
            "select" => Step::Select(select::Select::from(&step_info)),
            "union"  => Step::Union(join::Union::from(&step_info)),
            "filter" => Step::Filter(filter::Filter::from(&step_info)),
            "sort" =>   Step::Sort(sort::Sort::from(&step_info)),
            "join" =>   Step::Join(join::Join::from(&step_info)),
            _ => {
                Step::Empty
            }
        }
    }
}

impl Step {
    ///
    ///
    ///
    pub fn build(&self) -> Result<String> {
        match self {
            Step::Reader(x) =>  x.build(),
            Step::Select(x) => x.build(),
            Step::Union(x) => x.build(),
            Step::Filter(x)=>x.build(),
            Step::Sort(x)=>x.build(),
            Step::Join(x)=>x.build(),
            Step::Agg(_) => { Ok(String::new())}
            _ => Ok(String::new())
        }
    }

}

///
/// 构建分步查询脚本
///
pub fn build_steps_script(step_infos:&Vec<StepInfo>)->Result<String>{

    let mut scripts:Vec<String> = Vec::with_capacity(step_infos.len());
    for idx in 0..step_infos.len(){
        let step = Step::from(&step_infos[idx]);
        scripts.push(step.build().unwrap());
    }

    let script: String = scripts.iter().filter(|s|!s.is_empty()).join("\n.");

    //前一步骤的输出列

    Ok(format!("{}", script))
}

///
/// json 转 DSL 执行脚本
///
pub fn json_to_script(json_str:&str)->Result<String>{
    let json_result = serde_json::from_str::<Vec<StepInfo>>(json_str);
    match json_result {
        Ok(step_infos) => {
            build_steps_script(&step_infos)
        }
        Err(_) => {
            Ok(String::from("error"))
        }
    }
}

#[cfg(test)]
mod tests {

    #[test]
    fn query() {

    }
}
