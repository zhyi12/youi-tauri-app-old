use rhai::plugin::*;

///
/// 注册polars数据计算函数
///
#[export_module]
pub mod ds_module {
    use polars_lazy::dsl::When;
    use polars_lazy::dsl::WhenThen;
    use rhai::{Dynamic};
    use youi_dataframe::lazy::{JsLazyFrame,JsExpr};

    pub type DF = JsLazyFrame;

    pub type JE = JsExpr;

    pub type W = When;

    pub type WT = WhenThen;

    ///
    /// 读取csv文件
    ///
    pub fn read_csv(path:String)->DF{
        DF::read_csv(path)
    }
    ///
    /// 读取sqlite 数据库数据
    ///
    pub fn read_sql(connect:String,sql:String)->DF{
        DF::read_sql(connect,sql)
    }

    ///
    /// 输出csv文件
    ///
    pub fn write_csv(df:DF,path:String)->DF{
        DF::write_csv(df,path)
    }

    ///
    /// 写入sqlite数据库
    ///
    pub fn write_sql(df:DF,connect:String,table_name:String,
                     input_col_names:Vec<Dynamic>,output_col_names:Vec<Dynamic>)->DF{
        let input_col_names:Vec<String> = input_col_names.iter().map(|item|item.clone_cast::<String>()).collect();
        let output_col_names:Vec<String> = output_col_names.iter().map(|item|item.clone_cast::<String>()).collect();
        DF::write_sql(df,connect,input_col_names,table_name,output_col_names)
    }

    ///
    /// 读取csv 列表头
    ///
    pub fn read_csv_header(path:String)->DF{
        DF::read_csv_header(path)
    }
    ///
    /// 分页读取csv数据
    ///
    pub fn pager_read_csv(path:String,page_index:i64,page_size:i64)->DF{
        DF::pager_read_csv(path,page_index,page_size)
    }
    ///
    /// 选择
    ///
    pub fn select(df:DF,js_exprs:Vec<JsExpr>)->DF{
        df.select(js_exprs)
    }
    ///
    /// 汇总
    ///
    pub fn agg(df:DF,by:String,js_exprs:Vec<JsExpr>)->DF{
        df.agg(by,js_exprs)
    }
    ///
    /// 排序
    ///
    pub fn sort_by_exprs(df:DF,js_exprs:Vec<JsExpr>,reverses:String)->DF{
        df.sort_by_exprs(js_exprs,reverses)
    }

    ///
    /// 过滤
    ///
    pub fn filter(df:DF,expr:JsExpr)->DF{
        df.filter(expr)
    }

    ///
    /// 排序
    ///
    pub fn sort(df:DF,name:String,descending:bool)->DF{
        df.sort(name,descending)
    }
    ///
    /// 返回指定行数数据
    ///
    pub fn limit(df:DF,n:i64)->DF{
        df.limit(n)
    }

    ///
    /// 连接数据集
    ///
    pub fn join(df:DF,other:JsLazyFrame,how:&str,left_on:String,right_on:String)->DF{
        df.join(other,how,left_on,right_on)
    }

    ///
    /// 左连接
    ///
    pub fn left_join(df:DF,other:JsLazyFrame,left_on:String,right_on:String)->DF{
        df.left_join(other,left_on,right_on)
    }
    ///
    /// 上下合并
    ///
    pub fn union(df:DF,other:JsLazyFrame)->DF{
        df.union(other)
    }

    ///
    /// 多数据集合并
    ///
    pub fn concat(dfs:Vec<Dynamic>)->DF{
        let dfs = dfs.iter().map(|d|d.clone_cast()).collect();
        DF::concat(dfs)
    }

    ///
    ///
    ///
    pub fn with_columns(df:DF,js_exprs:Vec<JsExpr>)->DF{
        df.with_columns(js_exprs)
    }

    ///
    /// 索引匹配
    ///
    pub fn match_items(df:DF,df_idx:DF,fields:String,search_filed:String,out_filed:String)->DF{
        let text_fields = fields.split(",").map(|s|String::from(s)).collect();
        DF{
            df:youi_dataframe::column_match::df_match_items(df.df,&df_idx.df,&text_fields,search_filed,out_filed)
        }
    }
    ///
    ///
    ///
    pub fn exprs(exprs: &mut Vec<Dynamic>)->Vec<JsExpr>{
        exprs.iter().map(|elem|{
            let js_expr:JsExpr = elem.clone_cast();
            js_expr
        }).collect()
    }

    ///
    ///
    ///
    pub fn col(name:String)->JE{
        JE::col(name)
    }

    pub fn cols(names:Vec<String>)->JE{
        JE::cols(names)
    }

    pub fn first(expr:JE)->JE{
        JE::first(expr)
    }

    pub fn last(expr:JE)->JE{
        JE::last(expr)
    }

    pub fn count(expr:JE)->JE{
        JE::count(expr)
    }

    pub fn sum(expr:JE)->JE{
        JE::sum(expr)
    }

    pub fn min(expr:JE)->JE{
        JE::min(expr)
    }

    pub fn max(expr:JE)->JE{
        JE::max(expr)
    }

    pub fn list(expr:JE)->JE{
        JE::list(expr)
    }


    ///
    /// 平均数
    ///
    pub fn mean(expr:JE)->JE{
        JE::mean(expr)
    }
    ///
    /// marks that we want to compute something within a group, but doesn't modify the original size of the DataFrame
    /// df.select(
    ///     [
    ///         "Type 1",
    ///         "Type 2",
    ///         pl.col("Attack").mean().over("Type 1").alias("avg_attack_by_type"),
    ///         pl.col("Defense").mean().over(["Type 1", "Type 2"]).alias("avg_defense_by_type_combination"),
    ///         pl.col("Attack").mean().alias("avg_attack"),
    ///     ]
    /// )
    ///
    pub fn over(expr:JE,js_exprs:Vec<JsExpr>)->JE{
        JE::over(expr,js_exprs)
    }

    pub fn alias(expr:JE,alias_name:String)->JE{
        JE::alias(expr,alias_name)
    }

    pub fn is_null(expr:JE)->JE{
        JE::is_null(expr)
    }

    pub fn is_not_null(expr:JE)->JE{
        JE::is_not_null(expr)
    }

    pub fn eq(expr:JE,other:JsExpr)->JE{
        JE::eq(expr,other)
    }

    pub fn gt(expr:JE,other:JsExpr)->JE{
        JE::gt(expr,other)
    }

    pub fn gte(expr:JE,other:JsExpr)->JE{
        JE::gte(expr,other)
    }

    pub fn lt(expr:JE,other:JsExpr)->JE{
        JE::lt(expr,other)
    }

    pub fn lte(expr:JE,other:JsExpr)->JE{
        JE::lte(expr,other)
    }

    pub fn or(expr:JE,other:JsExpr)->JE{
        JE::or(expr,other)
    }

    pub fn and(expr:JE,other:JsExpr)->JE{
        JE::and(expr,other)
    }

    #[rhai_fn(name = "expr")]
    pub fn value_expr(value:String)->JE{
        JE::value_expr(value)
    }

    #[rhai_fn(name = "expr")]
    pub fn value_expr_i64(value:i64)->JE{
        JE::value_expr_i64(value)
    }

    #[rhai_fn(name = "expr")]
    pub fn value_expr_bool(value:bool)->JE{
        JE::value_expr_bool(value)
    }

    #[rhai_fn(name = "expr")]
    pub fn value_expr_f64(value:f64)->JE{
        JE::value_expr_f64(value)
    }

    pub fn concat_str(expr:JE,js_exprs:Vec<JsExpr>, sep: &str)-> JE{
        JE::concat_str(expr,js_exprs,sep)
    }
    ///
    ///
    ///
    pub fn str_slice(expr:JE,start: i64,len:i64)->JE{
        JE::str_slice(expr,start,len)
    }
    ///
    ///
    ///
    pub fn str_length(expr:JE) -> JE{
        JE::str_length(expr)
    }

    ///
    ///
    ///
    pub fn str_split(expr:JE,by:String) -> JE{
        JE::str_split(expr,&by)
    }
    ///
    ///
    ///
    pub fn str_replace(expr:JE,pat: String, val: String) -> JE{
        JE::str_replace(expr,pat,val)
    }
    ///
    ///
    ///
    pub fn str_replace_all(expr:JE,pat: String, val: String) -> JE{
        JE::str_replace_all(expr,pat,val)
    }

    ///
    ///
    ///
    pub fn str_contains(expr:JE,pat: String)->JE{
        JE::str_contains(expr,pat)
    }
    ///
    ///
    ///
    pub fn cast_str(expr:JE)->JE{
        JE::cast_str(expr)
    }

    pub fn add(expr:JE,js_expr:JsExpr)->JE{
        JE::add(expr,js_expr)
    }

    pub fn sub(expr:JE,js_expr:JsExpr)->JE{
        JE::sub(expr,js_expr)
    }

    pub fn mul(expr:JE,js_expr:JsExpr)->JE{
        JE::mul(expr,js_expr)
    }

    pub fn div(expr:JE,js_expr:JsExpr)->JE{
        JE::div(expr,js_expr)
    }

    pub fn when(js_expr:JsExpr)->W{
       JE::when(js_expr)
    }

    pub fn then(w:W,js_expr:JsExpr)->WT{
        JE::then(w,js_expr)
    }

    pub fn otherwise(wt:WT,js_expr:JsExpr)->JE{
        JE::otherwise(wt,js_expr)
    }

    ///
    ///
    ///
    pub fn flatten(expr:JE)->JE{
        JE::flatten(expr)
    }
}