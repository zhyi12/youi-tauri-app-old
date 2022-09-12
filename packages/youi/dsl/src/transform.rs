use rhai::{AST, Engine, Stmt, Expr, FnCallExpr, Dynamic};
///
/// 转换为可执行的脚本
///
pub fn transform(script:&str) ->String {
    let mut engine = Engine::new();
    engine.set_max_expr_depths(0,0);
    let ast:AST = engine.compile(script).unwrap();

    let mut scripts = String::new();

    for stmt in ast.statements() {
        let res = transform_stmt(stmt);
        scripts.push_str(&res);
    }

    scripts
}

///
///
///
fn transform_stmt(stmt:&Stmt)->String{
    let mut scripts:String = String::new();

    match stmt {
        Stmt::Noop(_) => {}
        Stmt::If(_, _) => {}
        Stmt::Switch(_, _) => {}
        Stmt::While(_, _) => {}
        Stmt::Do(_, _, _) => {}
        Stmt::For(_, _) => {}
        Stmt::Var(x, ..) => {
            scripts.push_str("let ");
            scripts.push_str(&x.0.name);
            scripts.push_str(" = ");
            scripts.push_str(&transform_expr(&x.1));
            scripts.push_str(";");
        }
        Stmt::Assignment(x) => {
            println!("Assignment {:?}",x);
        }
        Stmt::FnCall(x, _) => {
            scripts.push_str(&transform_fn(&x));
        }
        Stmt::Block(_) => {
            println!("Block");
        }
        Stmt::TryCatch(_, _) => {}
        Stmt::Expr(x) => {
            scripts.push_str(" ");
            scripts.push_str(&transform_expr(&x));
            scripts.push_str(";");
        }
        Stmt::BreakLoop(_, _) => {}
        Stmt::Return(_, _, _) => {
            //scripts.push_str(&transform_expr(&x.as_ref().unwrap()));
        }
        _=> {
            println!("ELSE");
        }
    }

    scripts
}

///
///
///
fn transform_expr(expr:&Expr) -> String{
    
    let mut scripts:String = String::new();
    match expr {
        Expr::DynamicConstant(x, _) => {
            let dynamic:&Dynamic = x.as_ref();

            match dynamic.type_name() {
                "array" =>{
                    //let array = dynamic.clone().into_array().unwrap();
                    //let script = array.iter().map(|v|format!("\"{}\"",v)).join(",");
                    scripts.push_str(&dynamic.to_string());
                }
                _ => {

                }
            }
        }
        Expr::BoolConstant(x, _) =>{
            scripts.push_str(x.to_string().as_str());
        }
        Expr::IntegerConstant(x, _)=>{
            scripts.push_str(x.to_string().as_str());
        }
        Expr::FloatConstant (x, _)=>{
            scripts.push_str(x.to_string().as_str());
        }
        Expr::CharConstant(x, _)=> {
            scripts.push_str(x.to_string().as_str());
        }
        Expr::StringConstant(x, _) => {
            scripts.push_str("\"");
            scripts.push_str(x);
            scripts.push_str("\"");
        }
        Expr::InterpolatedString(_, _) => {
            println!("InterpolatedString");
        }
        Expr::Array(x, _) => {
            scripts.push_str("[");
            if x.len()>0 {
                for e in x.as_ref() {
                    scripts.push_str(&transform_expr(&e));
                    scripts.push_str(",");
                }
                scripts.remove(scripts.len() - 1);
            }
            scripts.push_str("]");
        }
        Expr::Map(_, _) => {println!("Map ");}
        Expr::Unit(_) => {println!("Unit ");}
        Expr::Variable(x, _, _) => {
            scripts.push_str(&x.3);
        }
        Expr::Property(_, _) => {
            println!("Property ");
        }
        Expr::Stmt(_) => {
            println!("Stmt {:?}","");
        }
        Expr::FnCall(x, _) | Expr::MethodCall(x, _) => {
            scripts.push_str(&transform_fn(&x));
            //println!("fn call {:?}",x);
        }
        Expr::Dot(x, _, _) => {
            scripts.push_str(&transform_expr(&x.lhs));
            scripts.push_str(".");
            scripts.push_str(&transform_expr(&x.rhs));
        }
        Expr::Index(_, _, _) => {
            println!("Index ");
        }
        Expr::And(_, _) => {
            println!("And ");
        }
        Expr::Or(_, _) => {
            println!("Or ");
        }
        Expr::Custom(_, _) => {
            println!("Custom ");
        }
        _ => {
            println!("else ");
        }
    }

    scripts
}

///
///处理四则运行
///
fn transform_fn(fn_expr:&FnCallExpr) -> String{
    let mut scripts:String = String::new();

    match fn_expr.name.as_str() {
        "+" => {
            scripts.push_str(&transform_addition_fn(fn_expr,"add"));
        }
        "-" => {
            scripts.push_str(&transform_addition_fn(fn_expr,"sub"));
        }
        "*" => {
            scripts.push_str(&transform_addition_fn(fn_expr,"mul"));
        }
        "/" => {
            scripts.push_str(&transform_addition_fn(fn_expr,"div"));
        }
        _ => {
            scripts.push_str(&fn_expr.name);
            scripts.push_str("(");
            if fn_expr.args.len()>0 {
                for e in &fn_expr.args {
                    scripts.push_str(&transform_expr(&e));
                    scripts.push_str(",");
                }
                scripts.remove(scripts.len() - 1);
            }
            scripts.push_str(")");
        }
    }
    scripts
}
///
/// 四则运算函数处理
///
fn transform_addition_fn(fn_expr:&FnCallExpr,op:&str)->String{
    let mut scripts:String = String::new();
    scripts.push_str(&transform_addition(&fn_expr.args[0]));
    scripts.push_str(".");
    scripts.push_str(op);
    scripts.push_str("(");
    scripts.push_str(&transform_addition(&fn_expr.args[1]));
    scripts.push_str(")");
    scripts
}

///
/// 四则运算参数处理
///
fn transform_addition(expr:&Expr)->String{
    let mut scripts:String = String::new();
    match expr {
        Expr::IntegerConstant(_, _) | Expr::FloatConstant(_,_) => {
            scripts.push_str("expr(");
            scripts.push_str(&transform_expr(expr));
            scripts.push_str(")");
        }
        Expr::FnCall(_, _) | Expr::MethodCall(_, _) => {
            scripts.push_str(&transform_expr(expr));
        }
        _=>{}
    }
    scripts
}
