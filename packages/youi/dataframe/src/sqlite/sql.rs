use fehler::{throw, throws};
use sqlparser::ast::{Expr, Function, FunctionArg, FunctionArgExpr,
                     Ident, ObjectName, Query, Select, SelectItem, SetExpr, Statement,
                     TableAlias, TableFactor, TableWithJoins, Value};
use sqlparser::dialect::Dialect;
use sqlparser::parser::Parser;
use crate::errors::SqlError;


#[derive(Debug, Clone)]
pub enum CXQuery<Q = String> {
    Naked(Q),   // The query directly comes from the user
    Wrapped(Q), // The user query is already wrapped in a subquery
}

impl<Q: std::fmt::Display> std::fmt::Display for CXQuery<Q> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CXQuery::Naked(q) => write!(f, "{}", q),
            CXQuery::Wrapped(q) => write!(f, "{}", q),
        }
    }
}

impl<Q: AsRef<str>> CXQuery<Q> {
    pub fn as_str(&self) -> &str {
        match self {
            CXQuery::Naked(q) => q.as_ref(),
            CXQuery::Wrapped(q) => q.as_ref(),
        }
    }
}

impl From<&str> for CXQuery {
    fn from(s: &str) -> CXQuery<String> {
        CXQuery::Naked(s.to_string())
    }
}

impl From<&&str> for CXQuery {
    fn from(s: &&str) -> CXQuery<String> {
        CXQuery::Naked(s.to_string())
    }
}

impl From<&String> for CXQuery {
    fn from(s: &String) -> CXQuery {
        CXQuery::Naked(s.clone())
    }
}

impl From<&CXQuery> for CXQuery {
    fn from(q: &CXQuery) -> CXQuery {
        q.clone()
    }
}

// impl CXQuery<String> {
//     pub fn naked<Q: AsRef<str>>(q: Q) -> Self {
//         CXQuery::Naked(q.as_ref().to_string())
//     }
// }

impl<Q: AsRef<str>> AsRef<str> for CXQuery<Q> {
    fn as_ref(&self) -> &str {
        match self {
            CXQuery::Naked(q) => q.as_ref(),
            CXQuery::Wrapped(q) => q.as_ref(),
        }
    }
}

impl<Q> CXQuery<Q> {
    pub fn map<F, U>(&self, f: F) -> CXQuery<U>
        where
            F: Fn(&Q) -> U,
    {
        match self {
            CXQuery::Naked(q) => CXQuery::Naked(f(q)),
            CXQuery::Wrapped(q) => CXQuery::Wrapped(f(q)),
        }
    }
}

impl<Q, E> CXQuery<Result<Q, E>> {
    pub fn result(self) -> Result<CXQuery<Q>, E> {
        match self {
            CXQuery::Naked(q) => q.map(CXQuery::Naked),
            CXQuery::Wrapped(q) => q.map(CXQuery::Wrapped),
        }
    }
}

// wrap a query into a derived table
fn wrap_query(
    query: &mut Query,
    projection: Vec<SelectItem>,
    selection: Option<Expr>,
    tmp_tab_name: &str,
) -> Statement {
    let with = query.with.clone();
    query.with = None;
    let alias = if tmp_tab_name.is_empty() {
        None
    } else {
        Some(TableAlias {
            name: Ident {
                value: tmp_tab_name.into(),
                quote_style: None,
            },
            columns: vec![],
        })
    };
    Statement::Query(Box::new(Query {
        with,
        body: Box::new(SetExpr::Select(Box::new(Select {
            distinct: false,
            top: None,
            projection,
            into: None,
            from: vec![TableWithJoins {
                relation: TableFactor::Derived {
                    lateral: false,
                    subquery: Box::new(query.clone()),
                    alias,
                },
                joins: vec![],
            }],
            lateral_views: vec![],
            selection,
            group_by: vec![],
            cluster_by: vec![],
            distribute_by: vec![],
            sort_by: vec![],
            having: None,
            qualify: None
        }))),
        order_by: vec![],
        limit: None,
        offset: None,
        fetch: None,
        lock: None
    }))
}

trait StatementExt {
    fn as_query(&self) -> Option<&Query>;
}

impl StatementExt for Statement {
    fn as_query(&self) -> Option<&Query> {
        match self {
            Statement::Query(q) => Some(q),
            _ => None,
        }
    }
}

// trait QueryExt {
//     fn as_select_mut(&mut self) -> Option<&mut Select>;
// }

// impl QueryExt for Query {
//     fn as_select_mut(&mut self) -> Option<&mut Select> {
//
//         match self.body.as_ref() {
//             SetExpr::Select(x) => {
//
//                 let mut select:Select = x.as_ref().clone();
//                 println!("select {:?}",select);
//                 //Some(&mut select.clone())
//                 Some(&mut select)
//             },
//             _ => None,
//         }
//     }
// }

#[throws(SqlError)]
pub fn count_query<T: Dialect>(sql: &CXQuery<String>, dialect: &T) -> CXQuery<String> {
    // trace!("Incoming query: {}", sql);

    const COUNT_TMP_TAB_NAME: &str = "CXTMPTAB_COUNT";

    #[allow(unused_mut)]
        let mut table_alias = COUNT_TMP_TAB_NAME;

    let tsql = match sql.map(|sql| Parser::parse_sql(dialect, sql)).result() {
        Ok(ast) => {
            let projection = vec![SelectItem::UnnamedExpr(Expr::Function(Function {
                name: ObjectName(vec![Ident {
                    value: "count".to_string(),
                    quote_style: None,
                }]),
                args: vec![FunctionArg::Unnamed(FunctionArgExpr::Wildcard)],
                over: None,
                distinct: false,
            }))];
            let ast_count: Statement = match ast {
                CXQuery::Naked(ast) => {
                    if ast.len() != 1 {
                        throw!(SqlError::SqlQueryNotSupported(sql.to_string()));
                    }
                    let mut query = ast[0]
                        .as_query()
                        .ok_or_else(|| SqlError::SqlQueryNotSupported(sql.to_string()))?
                        .clone();
                    if query.offset.is_none() {
                        query.order_by = vec![]; // mssql offset must appear with order by
                    }
                    // let select = query
                    //     .as_select_mut()
                    //     .ok_or_else(|| SqlError::SqlQueryNotSupported(sql.to_string()))?;
                    // select.sort_by = vec![];
                    wrap_query(&mut query, projection, None, table_alias)
                }
                CXQuery::Wrapped(ast) => {
                    if ast.len() != 1 {
                        throw!(SqlError::SqlQueryNotSupported(sql.to_string()));
                    }
                    let query = ast[0]
                        .as_query()
                        .ok_or_else(|| SqlError::SqlQueryNotSupported(sql.to_string()))?
                        .clone();
                    // let select = query
                    //     .as_select_mut()
                    //     .ok_or_else(|| SqlError::SqlQueryNotSupported(sql.to_string()))?;
                    // select.projection = projection;
                    Statement::Query(Box::new(query))
                }
            };
            format!("{}", ast_count)
        }
        Err(_) => {
            // warn!("parser error: {:?}, manually compose query string", e);
            format!(
                "SELECT COUNT(*) FROM ({}) as {}",
                sql.as_str(),
                COUNT_TMP_TAB_NAME
            )
        }
    };

    // debug!("Transformed count query: {}", tsql);
    CXQuery::Wrapped(tsql)
}



#[throws(SqlError)]
pub fn limit1_query<T: Dialect>(sql: &CXQuery<String>, dialect: &T) -> CXQuery<String> {
    // trace!("Incoming query: {}", sql);

    let sql = match Parser::parse_sql(dialect, sql.as_str()) {
        Ok(mut ast) => {
            if ast.len() != 1 {
                throw!(SqlError::SqlQueryNotSupported(sql.to_string()));
            }

            match &mut ast[0] {
                Statement::Query(q) => {
                    q.limit = Some(Expr::Value(Value::Number("1".to_string(), false)));
                }
                _ => throw!(SqlError::SqlQueryNotSupported(sql.to_string())),
            };

            format!("{}", ast[0])
        }
        Err(_e) => {
            // warn!("parser error: {:?}, manually compose query string", e);
            format!("{} LIMIT 1", sql.as_str())
        }
    };

    // debug!("Transformed limit 1 query: {}", sql);
    CXQuery::Wrapped(sql)
}