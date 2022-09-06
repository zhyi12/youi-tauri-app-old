use std::fs::File;
use std::ops::{Add, Div, Mul, Sub};
use polars_core::frame::{DataFrame,UniqueKeepStrategy};
use polars_core::prelude::{DataType, IntoSeries, JoinType, NamedFrom, Series, SortOptions,PolarsError};
use polars_core::utils::concat_df;
use polars_io::csv::CsvWriter;
use polars_io::SerWriter;
use polars_lazy::dsl::{col, cols,when};
use polars_lazy::dsl::Expr::{Literal};
use polars_lazy::logical_plan::LiteralValue;
use polars_lazy::prelude::*;
use polars_ops::prelude::Utf8NameSpaceImpl;
use crate::sqlite::SqliteLazyReader;
use crate::sqlite::write::SqliteWriter;


///
///
///
#[derive(Clone)]
pub struct JsLazyFrame{
    pub df:LazyFrame
}

#[derive(Clone)]
pub struct JsExpr{
    pub expr:Expr,
}

struct ColumnItem{
    name:String,
    data_type:String
}

impl JsLazyFrame {
    ///
    /// 读取csv文件
    ///
    pub fn read_csv(path:String) -> Self {
        let mut errors :Vec<String> = Vec::new();

        let result_df = LazyCsvReader::new(path)
            .with_ignore_parser_errors(true).finish();

        match result_df {
            Ok(x) => {
                return Self{df:x};
            }
            Err(_) => {
                errors.push(String::from("数据文件异常"));
            }
        }

        Self{df:DataFrame::new(vec![Series::new("error",&errors)]).unwrap().lazy()}
    }

    ///
    /// 读取sqlite数据库数据
    ///
    pub fn read_sql(connect:String,sql:String) -> Self{
        Self{
            df:LazyFrame::scan_sqlite(&connect,&sql,Some(1),None).unwrap()
        }
    }
    ///
    /// 读取csv头信息
    ///
    pub fn read_csv_header(path:String) -> Self{
        let result_lf = LazyCsvReader::new(path)
            .with_ignore_parser_errors(true)
            .with_skip_rows(0)
            .with_n_rows(Option::Some(1))
            .finish();

        let mut errors :Vec<String> = Vec::new();

        match result_lf {
            Ok(x) => {
                let result_df = x.collect();

                match result_df {
                    Ok(x) => {
                        let items:Vec<ColumnItem> = x.get_columns().iter().map(|s|(ColumnItem{
                            name:String::from(s.name()),
                            data_type:String::from(s.dtype().to_string())
                        })).collect();

                        let v1:Vec<String> = items.iter().map(|item|String::from(item.name.as_str())).collect();
                        let v2:Vec<String> = items.iter().map(|item|String::from(item.data_type.as_str())).collect();

                        let df = DataFrame::new(vec![Series::new("name",&v1), Series::new("dataType",&v2)]);

                        return Self{df:df.unwrap().lazy()};
                    }
                    Err(_) => {
                        errors.push(String::from("数据文件异常"));
                    }
                }
            }
            Err(_) => {
                errors.push(String::from("csv 读取异常"));
            }
        }

        Self{df:DataFrame::new(vec![Series::new("error",&errors)]).unwrap().lazy()}

    }
    ///
    ///
    ///
    pub fn pager_read_csv(path:String,page_index:i64,page_size:i64) -> Self {
        let start_row:usize = ((page_index-1)*page_size) as usize;

        let mut errors :Vec<String> = Vec::new();
        let result_df = LazyCsvReader::new(path)
            .with_ignore_parser_errors(true)
            .with_skip_rows(start_row)
            .with_n_rows(Option::Some(page_size as usize))
            .finish();
        match result_df {
            Ok(x) => {
                return Self{df:x};
            }
            Err(_) => {
                errors.push(String::from("数据文件异常"));
            }
        }

        Self{df:DataFrame::new(vec![Series::new("error",&errors)]).unwrap().lazy()}
    }



    ///
    /// 写csv文件
    ///
    pub fn write_csv(self,path:String) -> Self{
        let out_file = File::create(path).unwrap();
        let mut out_df = self.df.clone().collect().unwrap();
        CsvWriter::new(out_file).finish(&mut out_df).unwrap();
        self
    }

    ///
    /// 写入数据库
    ///
    pub fn write_sql(self,connect:String,input_names:Vec<String>,table_name:String,output_names:Vec<String>)-> Self{
        let out_df = self.df.clone().collect().unwrap();
        println!("table_name {}",table_name);
        let df = SqliteWriter::new(&connect,&table_name,output_names,Some(1))
            .finish(&out_df,input_names).unwrap();
        //TODO 数据库生成列处理
        Self{df}
    }

    ///
    /// 读取每一列第一个数据
    ///
    pub fn read_first(self)-> Self{
        let clone = self.df.clone().collect().unwrap();
        let column_names = clone.get_column_names();
        let exprs:Vec<Expr> = column_names.iter().map(|name|col(name).first()).collect();
        Self{df:self.df.select(exprs)}
    }


    ///
    /// 连接数据集
    ///
    pub fn join(self,other:JsLazyFrame,how:&str,left_on:String,right_on:String) -> Self{
        //
        let how = match how {
            "left" => JoinType::Left,
            "inner" => JoinType::Inner,
            "outer" => JoinType::Outer,
            "cross" => JoinType::Cross,
            _ => panic!("not supported"),
        };

        let left_on:Vec<_> = left_on.split(",").map(|name|col(name)).collect();
        let right_on:Vec<_> = right_on.split(",").map(|name|col(name)).collect();

        let df = self.df.join_builder()
            .with(other.df)
            .left_on(left_on)
            .right_on(right_on)
            // .allow_parallel(allow_parallel)
            // .force_parallel(force_parallel)
            .how(how)
            // .suffix(suffix)
            .finish()
            .into();

        Self{df}
    }
    ///
    /// 左联接
    ///
    pub fn left_join(self,other:JsLazyFrame,left_on:String,right_on:String)->Self{
        let left_on:Vec<_> = left_on.split(",").map(|name|col(name)).collect();
        let right_on:Vec<_> = right_on.split(",").map(|name|col(name)).collect();

        let df = self.df.join_builder()
            .with(other.df)
            .left_on(left_on)
            .right_on(right_on)
            .how(JoinType::Left)
            .finish()
            .into();

        Self{df}
    }
    ///
    ///
    ///
    pub fn select(self,js_exprs:Vec<JsExpr>)->Self{
        let exprs:Vec<Expr> = js_exprs.iter().map(|js_expr|js_expr.expr.clone()).collect();

        Self { df:self.df.select(exprs)}
    }

    ///
    /// 过滤
    ///
    pub fn filter(self,expr:JsExpr) -> Self{
        Self{df:self.df.filter(expr.expr)}
    }
    ///
    /// 汇总
    ///
    pub fn agg(self,by:String,js_exprs:Vec<JsExpr>)->Self{
        let by:Vec<Expr> = by.split(",").map(|name|col(name)).collect();
        let exprs:Vec<Expr> = js_exprs.iter().map(|js_expr|js_expr.expr.clone()).collect();
        let df = self.df.groupby(by).agg(exprs);
        Self{df}
    }
    ///
    /// 排序
    ///
    pub fn sort(self,name:String,descending:bool)->Self{
        let sort_opt = SortOptions{
            descending,
            nulls_last: true
        };
        let df = self.df.sort(&name, sort_opt);
        Self{df}
    }

    ///
    /// 多列排序
    ///
    pub fn sort_by_exprs(self,js_exprs:Vec<JsExpr>,reverses:String)->Self{
        let exprs:Vec<Expr> = to_exprs(js_exprs);
        let reverse:Vec<bool> = reverses.split(",").map(|name|name.eq("true")).collect();
        Self{df:self.df.sort_by_exprs(exprs,reverse,true)}
    }
    ///
    ///
    ///
    pub fn limit(self,n:i64)->Self{
        Self{df:self.df.limit(n as u32)}
    }
    ///
    ///
    ///
    pub fn unique(self,col_names:Vec<String>)->Self{
        Self{df:self.df.unique(Some(col_names),UniqueKeepStrategy::First)}
    }

    pub fn with_columns(self,js_exprs:Vec<JsExpr>)->Self{
        Self{df:self.df.with_columns(to_exprs(js_exprs))}
    }

    ///
    /// union
    ///
    pub fn union(self,other:JsLazyFrame)->Self{
        let m_df = self.df.collect().unwrap();
        let df = m_df.vstack(&other.df.collect().unwrap()).unwrap().lazy();
        Self{
            df
        }
    }

    ///
    /// 多数据集concat
    ///
    pub fn concat(dfs:Vec<JsLazyFrame>)->Self{
        let dfs:Vec<DataFrame> = dfs.iter().map(|d|d.clone().df.collect().unwrap()).collect();
        Self{
            df:concat_df(&dfs).unwrap().lazy()
        }
    }
}

fn to_exprs(js_exprs:Vec<JsExpr>)->Vec<Expr>{
    js_exprs.iter().map(|js_expr|js_expr.expr.clone()).collect()
}

impl JsExpr {
    pub fn col(name:String)->Self{
        Self{expr:col(&name)}
    }

    pub fn cols(names:Vec<String>)->Self{
        Self{expr:cols(names)}
    }
    ///
    ///
    ///
    pub fn first(self)->Self{
        Self{expr:self.expr.first()}
    }

    pub fn last(self)->Self{
        Self{expr:self.expr.last()}
    }

    pub fn count(self)->Self{
        Self{expr:self.expr.count()}
    }

    pub fn sum(self)->Self{
        Self{expr:self.expr.sum()}
    }

    pub fn min(self)->Self{
        Self{expr:self.expr.min()}
    }

    pub fn max(self)->Self{
        Self{expr:self.expr.max()}
    }

    pub fn list(self)->Self{
        Self{expr:self.expr.list()}
    }

    pub fn mean(self)->Self{
        Self{expr:self.expr.mean()}
    }

    pub fn over(self,js_exprs:Vec<JsExpr>)->Self{
        let exprs = to_exprs(js_exprs);
        Self{expr:self.expr.over(exprs)}
    }

    pub fn alias(self,alias_name:String)->Self{
        Self{expr:self.expr.alias(&alias_name)}
    }

    pub fn is_null(self)->Self{
        println!("{}","is null expr");
        Self{expr:self.expr.is_null()}
    }

    pub fn is_not_null(self)->Self{
        Self{expr:self.expr.is_not_null()}
    }

    pub fn eq(self,other:JsExpr)->Self{
        Self{expr:self.expr.eq(other.expr)}
    }

    pub fn gt(self,other:JsExpr)->Self{
        Self{expr:self.expr.gt(other.expr)}
    }

    pub fn gte(self,other:JsExpr)->Self{
        Self{expr:self.expr.gt_eq(other.expr)}
    }

    pub fn lt(self,other:JsExpr)->Self{
        Self{expr:self.expr.lt(other.expr)}
    }

    pub fn lte(self,other:JsExpr)->Self{
        Self{expr:self.expr.lt_eq(other.expr)}
    }

    pub fn or(self,other:JsExpr)->Self{
        Self{expr:self.expr.or(other.expr)}
    }

    pub fn and(self,other:JsExpr)->Self{
        Self{expr:self.expr.and(other.expr)}
    }

    
    pub fn value_expr(value:String)->Self{
        Self{expr:Literal(LiteralValue::Utf8(value))}
    }
    
    pub fn value_expr_i64(value:i64)->Self{
        Self{expr:Literal(LiteralValue::Int64(value))}
    }

    pub fn value_expr_bool(value:bool)->Self{
        Self{expr:Literal(LiteralValue::Boolean(value))}
    }

    pub fn value_expr_f64(value:f64)->Self{
        Self{expr:Literal(LiteralValue::Float64(value))}
    }

    pub fn concat_str(self,js_exprs:Vec<JsExpr>, sep: &str)-> Self{
        let exprs:Vec<Expr> = js_exprs.iter().map(|js_expr|js_expr.expr.clone()).collect();
        Self{expr:concat_str(exprs,sep)}
    }
    ///
    ///
    ///
    pub fn str_slice(self,start: i64,len:i64)->Self{
        let func = move |s: Series| {
            let ca = s.utf8()?;
            Ok(ca.str_slice(start, Some(len as u64))?.into_series())
        };

        Self{expr:self.expr.apply(func,GetOutput::from_type(DataType::Utf8))}
    }

    ///
    /// 字符长度
    ///
    pub fn str_length(self)->Self{
        let func = |s: Series| {
            let ca = s.utf8()?;
            Ok(ca.str_lengths().into_series())
        };
        Self{
            expr:self.expr.map(func, GetOutput::from_type(DataType::UInt32))
                .with_fmt("str.len")
                .into()
        }
    }

    ///
    /// Replace the leftmost (sub)string by a regex pattern
    ///
    pub fn str_replace(self,pat: String, val: String)->Self{
        let function = move |s: Series| {
            let ca = s.utf8()?;
            match ca.replace(&pat, &val) {
                Ok(ca) => Ok(ca.into_series()),
                Err(e) => Err(PolarsError::ComputeError(format!("{:?}", e).into())),
            }
        };

        Self{
            expr:self.expr.map(function, GetOutput::same_type())
                .with_fmt("str.replace")
                .into()
        }
    }
    ///
    /// Replace all (sub)strings by a regex pattern
    ///
    pub fn str_replace_all(self,pat: String, val: String)->Self{
        let func = move |s: Series| {
            let ca = s.utf8()?;
            match ca.replace_all(&pat, &val) {
                Ok(ca) => Ok(ca.into_series()),
                Err(e) => Err(PolarsError::ComputeError(format!("{:?}", e).into())),
            }
        };
        Self{
            expr:self.expr.map(func, GetOutput::same_type())
                .with_fmt("str.replace_all")
                .into()
        }
    }

    ///
    /// Check if strings contain a regex pattern
    ///
    pub fn str_contains(self,pat: String)->Self{
        let func = move |s: Series| {
            let ca = s.utf8()?;
            match ca.contains(&pat) {
                Ok(ca) => Ok(ca.into_series()),
                Err(e) => Err(PolarsError::ComputeError(format!("{:?}", e).into())),
            }
        };
        Self{
            expr:self.expr.map(func, GetOutput::from_type(DataType::Boolean))
                .with_fmt("str.contains")
                .into()
        }
    }

    ///
    /// Split the string by a substring.
    ///
    pub fn str_split(self, by: &str)->Self{
        Self{expr:self.expr.str().split(by)}
    }

    pub fn cast_str(self)->Self{
        Self{expr:self.expr.cast(DataType::Utf8)}
    }

    pub fn add(self,js_expr:JsExpr)->Self{
        Self{expr:self.expr.add(js_expr.expr)}
    }

    pub fn sub(self,js_expr:JsExpr)->Self{
        Self{expr:self.expr.sub(js_expr.expr)}
    }

    pub fn mul(self,js_expr:JsExpr)->Self{
        Self{expr:self.expr.mul(js_expr.expr)}
    }

    pub fn div(self,js_expr:JsExpr)->Self{
        Self{expr:self.expr.div(js_expr.expr)}
    }

    pub fn when(js_expr:JsExpr) -> When{
        when(js_expr.expr)
    }

    pub fn then(when:When,js_expr:JsExpr) -> WhenThen{
        when.then(js_expr.expr)
    }

    pub fn otherwise(when_then:WhenThen,js_expr:JsExpr) -> Self{
        Self{expr:when_then.otherwise(js_expr.expr)}
    }

    pub fn flatten(self)->Self{
        Self{expr:self.expr.flatten()}
    }
}