use std::pin::Pin;
use trees::{Node, Tree};
use super::{StepInfo,Result};

#[derive(Clone,Debug)]
pub enum Condition{
    And(usize),
    Or(usize),
    Condition(super::Condition)
}

impl Condition {

    pub fn from(cond:&super::Condition)->Self{
        match cond.name.as_ref().unwrap_or(&String::new()).as_str() {
            "AND" => Condition::And(cond.level.unwrap_or(1)),
            "OR" => Condition::Or(cond.level.unwrap_or(1)),
            _=>{Condition::Condition(cond.clone())}
        }
    }
}

impl Condition {

    ///
    ///
    ///
    pub fn get_level(&self)->usize{
        match self {
            Condition::And(l) => {l.clone()}
            Condition::Or(l) => {l.clone()}
            Condition::Condition(cond) => {cond.level.unwrap_or(1)}
        }
    }

    pub fn build(&self)->Result<String>{
        Ok(match self {
            Condition::And(_) => {String::from("and")}
            Condition::Or(_) => {String::from("or")}
            Condition::Condition(cond) => {format!("col(\"{}\").{}(expr(\"1\"))",cond.property.as_ref().unwrap(),
                                                   cond.operator.as_ref().unwrap())}
        })
    }
}

///{id:'root',text:'且',name:'and',type:'conn'}
pub struct Filter{
    pub id:String,
    pub name:String,
    pub condition_tree:Tree<Condition>
}

impl Filter {

    pub fn from(step_info:&StepInfo)->Self{

        let condition_tree:Tree<Condition> = build_condition_tree(&step_info.filters.as_ref().unwrap());

        Self{
            id:String::from(&step_info.id),
            name:String::from(&step_info.name),
            condition_tree
        }
    }
}

impl Filter {
    ///
    ///
    ///
    pub fn build(&self)->Result<String>{

        let filter_exprs = self.condition_tree_build(self.condition_tree.root())?;

        Ok(format!("filter({})",filter_exprs))

    }

    ///
    ///
    ///
    fn condition_tree_build(&self,node: &Node<Condition>)->Result<String>{
        if node.has_no_child() {
            node.data().build()
        } else {
            let connect = node.data().build()?;

            let cond_exprs:Vec<String> = node.iter().map(|n|{
                self.condition_tree_build(n).unwrap()
            }).collect();

            let mut result = String::new();
            for idx in 0..cond_exprs.len() {
                if idx > 0{
                    result.push_str(".");
                    result.push_str(&connect);
                    result.push_str("(");
                }

                result.push_str(&cond_exprs[idx]);

                if idx > 0{
                    result.push_str(")");
                }
            }

            Ok(result)
        }
    }
}

///
///
///
fn build_condition_tree(conditions:&Vec<super::Condition>)->Tree<Condition>{
    let root_data = Condition::from(&conditions[0]);
    let mut root = Tree::new(root_data);

    for idx in 1..conditions.len(){
        let cond = &conditions[idx];
        //
        let level = cond.level.unwrap_or(1);

        if level == 1{
            root.push_back(Tree::new(Condition::from(cond)));
        }else{
            add_tree_node(root.root_mut(),level,cond);
        }
    }

    println!("{:?}",root.node_count());
    root
}

///
///
///
fn add_tree_node(mut current: Pin<&mut Node<Condition>>, level:usize, cond:&super::Condition){

    let last = current.back_mut();

    match last {
        Some(mut last_node) => {
            let current_level = last_node.data().get_level();
            if current_level == level-1{
                //找到父节点
                last_node.push_back(Tree::new(Condition::from(cond)));
            }else{
                //进入下一级处理
                add_tree_node(last_node,level,cond);
            }
        }
        None => {
            //current为最后一个叶子节点时，插入新的节点
            let current_level = current.data().get_level();
            if current_level == level{
                //同级插入
                current.insert_next_sib(Tree::new(Condition::from(cond)));
            }else {
                println!("异常情况");
            }
        }
    }
}
