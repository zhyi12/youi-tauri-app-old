use polars_core::prelude::*;
use sqlx::{Column, Row, TypeInfo};
use sqlx::sqlite::{SqliteRow,SqliteColumn};

pub(crate) fn init_buffers(
    schema: &polars_core::prelude::Schema,
    capacity: usize,
) -> Result<PlIndexMap<String, Buffer>> {
    schema
        .iter()
        .map(|(name, dtype)| {
            let builder = match &dtype {
                DataType::Boolean => Buffer::Boolean(BooleanChunkedBuilder::new(name, capacity)),
                DataType::Int32 => Buffer::Int32(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::Int64 => Buffer::Int64(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::UInt32 => Buffer::UInt32(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::UInt64 => Buffer::UInt64(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::Float32 => Buffer::Float32(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::Float64 => Buffer::Float64(PrimitiveChunkedBuilder::new(name, capacity)),
                DataType::Utf8 => {
                    Buffer::Utf8(Utf8ChunkedBuilder::new(name, capacity, capacity * 5))
                }
                DataType::Datetime(_, _) => {
                    Buffer::Datetime(PrimitiveChunkedBuilder::new(name, capacity))
                }
                DataType::Date => Buffer::Date(PrimitiveChunkedBuilder::new(name, capacity)),
                _ => Buffer::All((Vec::with_capacity(capacity), name)),
            };
            Ok((name.clone(), builder))
        })
        .collect()
}

#[allow(clippy::large_enum_variant)]
pub(crate) enum Buffer<'a> {
    Boolean(BooleanChunkedBuilder),
    Int32(PrimitiveChunkedBuilder<Int32Type>),
    Int64(PrimitiveChunkedBuilder<Int64Type>),
    UInt32(PrimitiveChunkedBuilder<UInt32Type>),
    UInt64(PrimitiveChunkedBuilder<UInt64Type>),
    Float32(PrimitiveChunkedBuilder<Float32Type>),
    Float64(PrimitiveChunkedBuilder<Float64Type>),
    Utf8(Utf8ChunkedBuilder),
    Datetime(PrimitiveChunkedBuilder<Int64Type>),
    Date(PrimitiveChunkedBuilder<Int32Type>),
    All((Vec<AnyValue<'a>>, &'a str)),
}

impl<'a> Buffer<'a> {
    pub(crate) fn into_series(self) -> Result<Series> {
        let s = match self {
            Buffer::Boolean(v) => v.finish().into_series(),
            Buffer::Int32(v) => v.finish().into_series(),
            Buffer::Int64(v) => v.finish().into_series(),
            Buffer::UInt32(v) => v.finish().into_series(),
            Buffer::UInt64(v) => v.finish().into_series(),
            Buffer::Float32(v) => v.finish().into_series(),
            Buffer::Float64(v) => v.finish().into_series(),
            Buffer::Datetime(v) => v
                .finish()
                .into_series()
                .cast(&DataType::Datetime(TimeUnit::Milliseconds, None))
                .unwrap(),
            Buffer::Date(v) => v.finish().into_series().cast(&DataType::Date).unwrap(),
            Buffer::Utf8(v) => v.finish().into_series(),
            Buffer::All((vals, name)) => Series::new(name, vals),
        };
        Ok(s)
    }

    pub(crate) fn add(&mut self, row:&SqliteRow, column:&SqliteColumn) -> Result<()> {
        use Buffer::*;
        let column_name = column.name();
        let data_type = column.type_info().name();
        match self {
            Boolean(buf) => {
                match data_type {
                    "BOOL" | "BOOLEAN" => buf.append_value(row.get::<bool,&str>(column_name)),
                    _ => buf.append_null(),
                }
                Ok(())
            }
            Int64(buf) => {
                match data_type {
                    "INT" | "NUMBER" | "INTEGER" | "BIGINT" | "INT8" => buf.append_value(row.get::<i64,&str>(column_name)),
                    _ => buf.append_null(),
                }
                Ok(())
            }
            Float64(buf) => {
                match data_type {
                    "REAL" => buf.append_value(row.get::<f64,&str>(column_name)),
                    _ => buf.append_null(),
                }
                Ok(())
            }
            Utf8(buf) => {
                match data_type {
                    "VARCHAR" | "STRING" | "TEXT" => buf.append_value(row.get::<String,&str>(column_name)),
                    _ => buf.append_null(),
                }
                Ok(())
            }
            _ => {
                Ok(())
            }
        }
    }
}

