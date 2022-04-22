import {BaseCstVisitor, parseExpression} from '$lib/youi/util/expression.util';
import {buildFiltersScript} from "../../../lib/youi/util/cube.util";

class DfScriptVisitor extends BaseCstVisitor {

    constructor() {
        super()
        this.validateVisitor()
    }

    expression(ctx) {
        return this.visit(ctx.additionExpression)
    }

    identifierExpression(ctx) {
        return '"'+ctx.Identifier[0].image+'"'
    }

    columnNameExpression(ctx){
        return '"'+ctx.ColumnName[0].image+'"'
    }

    /**
     *
     * @param ctx {lhs:Expr,AdditionOperator:Array<Expr>,rhs:Array<Expr>}
     * @returns {string}
     */
    additionExpression(ctx) {
        let scripts = [];
        scripts.push(this.visit(ctx.lhs));
        ctx.rhs.forEach((rhsOperand,index) => {
            scripts.push("."+ctx.AdditionOperator[index].tokenType.name.toLowerCase()+'(');
            scripts.push(this.visit(rhsOperand))
            scripts.push(')');
        })
        return scripts.join('');
    }

    colFunction(ctx) {
        return 'col('+this.visit(ctx.base)+')';
    }

    multiplicationExpression(ctx) {
        let result = this.visit(ctx.lhs)
        // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
        if (ctx.rhs) {
            ctx.rhs.forEach((rhsOperand) => {
                // there will be one operator for each rhs operand
                this.visit(rhsOperand)
            })
        }
        return result
    }

    atomicExpression(ctx) {
        if (ctx.parenthesisExpression) {
            return this.visit(ctx.parenthesisExpression)
        } else if (ctx.FloatLiteral) {
            return 'expr('+parseFloat(ctx.FloatLiteral[0].image)+')'
        } else if (ctx.NumberLiteral) {
            return 'expr('+parseInt(ctx.NumberLiteral[0].image, 10)+')'
        } else if (ctx.colFunction) {
            return this.visit(ctx.colFunction)
        }
    }

    parenthesisExpression(ctx) {
        return this.visit(ctx.expression)
    }
}

export const ALL_STEPS = [
    {name:'filter',text:'过滤'},
    {name:'agg',text:'分组汇总'},
    {name:'addcol',text:'新增列'},
    {name:'column',text:'字段设置'},
    {name:'sort',text:'排序'},

    {name:'join',text:'左右连接'},
    {name:'union',text:'上下连接'}
];

export const SIMPLE_STEP_NAMES = ['filter','column','sort','agg'];

const scriptVisitor = new DfScriptVisitor();
/**
 *
 * @param steps
 */
export const buildStepsScript = (steps)=>{
    let scripts = [];
    let firstStep = steps[0];
    scripts.push('let df = '+firstStep.reader+'("'+firstStep.uri+'")\n');
    scripts.push(buildSelectScript(firstStep));

    //
    for(let i=1;i<steps.length;i++){
        //join union
        let step = steps[i];

        if(step.name == 'column'){
            scripts.push(buildSelectScript(step));
        }else if(step.name =='addcol'){
            let columns = findStepColumns(steps,step);
            let selectedColumnNames = columns.map(({name})=>name);
            scripts.push(buildSelectScript({columns,selectedColumnNames},[step.addedColumn]));
        }else if(step.name == 'filter'){
            let filterScript = buildFiltersScript(step.filters);
            if(filterScript){
                scripts.push('    .filter(');
                scripts.push(filterScript);
                scripts.push(')\n');
            }
        }
    }
    //
    scripts.push('    .limit(20);\n');

    scripts.push('df');

    let script = scripts.join('')

    return script;
}

export const findStepIndex = (steps,step)=>{
    return steps.map(({id},index)=>step.id==id?index:0).reduce((prev,value)=>prev+value);
}
/**
 *
 * @param steps
 * @param step
 */
export const findStepColumns = (steps,step)=>{
    let findingStep = null;
    if(step){
        let addedColumns = findPrevAllAddedColumns(steps,step);
        for(let i=steps.length-1;i>=0;i--){
            let curStep = steps[i];
            if(curStep.id == step.id){
                findingStep = curStep;
            }

            if(findingStep){
                if(Array.isArray(findingStep.columns)){
                    return findStepOutColumns(findingStep,addedColumns);
                }

                if(i>0){
                    findingStep = steps[i-1];
                }
            }
        }
    }
}

/**
 *
 * @param steps
 * @param step
 */
export const findPrevAllAddedColumns = (steps,step)=>{
    let addedColumns = [];
    let index = steps.map(({id},index)=>step.id==id?index:0).reduce((prev,value)=>prev+value);
    if(index>0){
        for(let i=0;i<steps.length;i++){
            let curStep = steps[i];
            if(curStep.id == step.id){
                break;
            }
            if(curStep.name==='join' || curStep.name==='union'
                || curStep.name==='select'|| curStep.name==='agg'){
                addedColumns = [];
            }
            if(curStep.addedColumn){
                addedColumns.push({id:curStep.addedColumn.id,name:curStep.addedColumn.name,text:curStep.addedColumn.text});
            }
        }
    }
    return addedColumns;
}

/**
 *
 * @param step
 */
function findStepOutColumns(step,addedColumns){
    let columns = [].concat(step.columns);

    if(step.selectedColumnNames && step.selectedColumnNames.length){
        columns = columns.filter(column=>step.selectedColumnNames.includes(column.name));
    }

    return columns.concat(addedColumns||[]);
}

/**
 *
 * @param step
 * @param refAddedColumns
 */
function buildSelectScript(step,refAddedColumns?){
    let scripts = [];
    scripts.push('    .select(exprs([');
    scripts.push(step.columns.filter(column=>step.selectedColumnNames.includes(column.name)).map(({name})=>'col("'+name+'")').join(','));

    if(refAddedColumns && refAddedColumns.length){
        refAddedColumns.forEach(addedColumn=>{
            const cst = parseExpression(addedColumn.expression);
            let result = scriptVisitor.visit(cst);
            scripts.push(",\n        ");
            scripts.push(result);
            scripts.push('.alias("'+addedColumn.text+'")');
        })
    }

    scripts.push(']))\n');
    return scripts.join('');
}

function findRefAddColumns(steps,step,stepIndex){
    let addColumns = [];
    for(let i=stepIndex+1;i<steps.length;i++){
        let curStep = steps[i];

        if(curStep.name === 'addcol'){
            addColumns.push(curStep.addedColumn);
        }

        if(curStep.name==='join' || curStep.name==='union'
            || curStep.name==='select'|| curStep.name==='agg'){
            break;
        }
    }
    return addColumns;
}