use std::sync::Arc;
use futures::executor::block_on;
use futures_util::future::join_all;
use polars_core::frame::DataFrame;
use polars_core::POOL;
use polars_core::prelude::{DataType, PlIndexMap, Result, Schema};
use polars_core::prelude::row::infer_schema;
use polars_core::utils::accumulate_dataframes_vertical;
use polars_lazy::prelude::{AnonymousScan, AnonymousScanOptions, LazyFrame, ScanArgsAnonymous};
use sqlparser::dialect::SQLiteDialect;
use sqlx::{Column, query, Row, SqlitePool, TypeInfo};
use sqlx::sqlite::SqliteRow;

mod sql;
mod conversion;
mod buffer;
pub mod write;
mod write_impl;


///
/// 扫描 sqlite 数据
///
pub struct SqliteScan{
    pool:SqlitePool,
    query_sql:String,
    pub n_rows:i32,
    rows_per_thread:i32,
    part_sql_list:Vec<String>,
    pub n_threads: Option<usize>
}

impl SqliteScan {

    pub fn new(connect:&str,query_sql:String,n_threads: Option<usize>) -> Result<SqliteScan> {

        let pool = block_on(sqlx::SqlitePool::connect(connect)).unwrap();

        let org_query = sql::CXQuery::from(query_sql.as_str());
        let count_query = sql::count_query(&org_query,&SQLiteDialect{});
        let binding = count_query.map(|q|q.clone()).unwrap();
        let count_sql:&str = binding.as_str();

        //记录总数
        let row = block_on(query(count_sql).fetch_one(&pool)).unwrap();

        let n_rows:i32 = row.get::<i32,&str>(row.column(0).name());

        let mut threads = n_threads.unwrap_or_else(|| POOL.current_num_threads());

        if n_rows < 128 {
            threads = 1
        }

        let rows_per_thread = n_rows / threads as i32;

        let mut part_sql_list = Vec::with_capacity(threads);

        for idx in 0..threads{
            let start = idx as i32 * rows_per_thread;
            part_sql_list.push( format!("{} limit {} offset {} ",query_sql,rows_per_thread,start));
        }

        Ok(SqliteScan { pool,query_sql, n_rows,n_threads:Some(threads),rows_per_thread,part_sql_list})
    }

    fn parse_lines<'a>(
        &self,
        rows:&Vec<SqliteRow>,
        buffers: &mut PlIndexMap<String, buffer::Buffer<'a>>) {

        rows.iter().for_each(|row|{
            buffers.iter_mut().for_each(|(key, inner)|{
                inner.add(row,row.column::<&str>(key)).unwrap();
            });
        });
    }

}

///
///
///
impl AnonymousScan for SqliteScan{

    ///
    /// 扫描数据
    ///
    fn scan(&self, scan_opts: AnonymousScanOptions) -> Result<DataFrame> {
        //self.pool.
        let schema = scan_opts.output_schema.unwrap_or(scan_opts.schema);

        let fut_values = async {

            let mut tasks = Vec::new();
            for idx in 0..self.n_threads.unwrap(){
                let start = idx as i32 * self.rows_per_thread;
                println!("{}. {} - {}",&self.part_sql_list[idx],idx,start);
                let query_task = query(&self.part_sql_list[idx]).fetch_all(&self.pool);
                tasks.push(query_task);
            }

            join_all(tasks).await
        };
        let results = block_on(fut_values);
        let dfs = results.iter().map(|rows|{

            let mut buffers = buffer::init_buffers(schema.as_ref(), self.rows_per_thread as usize).unwrap();
            println!("map {}","");
            let sqlite_rows = rows.as_ref().unwrap();
            self.parse_lines(sqlite_rows,&mut buffers);

            DataFrame::new(
                buffers
                    .into_values()
                    .map(|buf| buf.into_series())
                    .collect::<Result<_>>().unwrap(),
            ).unwrap()
        });

        let df = accumulate_dataframes_vertical(dfs).unwrap();

        Ok(df)
    }


    ///
    /// 使用 limit1_query 获取元数据
    ///
    fn schema(&self, infer_schema_length: Option<usize>) -> Result<Schema> {
        let org_query = sql::CXQuery::from(&self.query_sql);

        let limit_query = sql::limit1_query(&org_query, &SQLiteDialect{});

        let binding = limit_query.map(|q|q.clone()).unwrap();
        let limit_sql:&str = binding.as_str();

        let rows =
            block_on(query(limit_sql).fetch_all(&self.pool)).unwrap();

        let iter = rows.iter().map(|row|{
            let v = row.columns().iter().map(|column|{
                let key = String::from(column.name());
                let type_name = column.type_info().name();
                let dtype: conversion::DfDataType<DataType> = type_name.into();
                (key,dtype.0)
            });
            v.collect()
        });

        let schema = infer_schema(iter, infer_schema_length.unwrap_or(100));

        Ok(schema)
    }

    fn allows_predicate_pushdown(&self) -> bool {
        true
    }
    fn allows_projection_pushdown(&self) -> bool {
        true
    }
    fn allows_slice_pushdown(&self) -> bool {
        true
    }
}

///
///
///
pub trait SqliteLazyReader{

    fn scan_sqlite(connect: &str, query:&str, n_threads:Option<usize>,infer_schema_length:Option<usize>) -> Result<LazyFrame> {
        let f = SqliteScan::new(connect,query.to_string(),n_threads)?;

        let args = ScanArgsAnonymous {
            name: "SQLITE SCAN",
            infer_schema_length,
            n_rows: None,
            ..ScanArgsAnonymous::default()
        };

        LazyFrame::anonymous_scan(Arc::new(f), args)
    }


}



///
///
///
impl SqliteLazyReader for LazyFrame {

}
