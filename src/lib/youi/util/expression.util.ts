"use strict"
/**
 * An Example of implementing a Calculator with separated grammar and semantics (actions).
 * This separation makes it easier to maintain the grammar and reuse it in different use cases.
 *
 * This is accomplished by using the automatic CST (Concrete Syntax Tree) output capabilities
 * of chevrotain.
 *
 * See farther details here:
 * https://chevrotain.io/docs/guide/concrete_syntax_tree.html
 */
import { createToken, Lexer, CstParser } from "chevrotain";

// ----------------- lexer -----------------
// using the NA pattern marks this Token class as 'irrelevant' for the Lexer.
// AdditionOperator defines a Tokens hierarchy but only the leafs in this hierarchy define
// actual Tokens that can appear in the text
const AdditionOperator = createToken({
    name: "AdditionOperator",
    pattern: Lexer.NA
})

const ColumnName = createToken({name:'ColumnName',pattern:/[\u4e00-\u9fa5a-zA-Z0-9]+/})

const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ })

const Add = createToken({
    name: "Add",
    pattern: /\+/,
    categories: AdditionOperator
})
const Sub = createToken({
    name: "Sub",
    pattern: /-/,
    categories: AdditionOperator
})

const MultiplicationOperator = createToken({
    name: "MultiplicationOperator",
    pattern: Lexer.NA
})
const Mul = createToken({
    name: "Mul",
    pattern: /\*/,
    categories: MultiplicationOperator
})
const Div = createToken({
    name: "Div",
    pattern: /\//,
    categories: MultiplicationOperator
})

const LParen = createToken({ name: "LParen", pattern: /\(/ })
const RParen = createToken({ name: "RParen", pattern: /\)/ })

const FloatLiteral = createToken({
    name: "FloatLiteral",
    pattern: /[1-9]\d*\.\d+/
})

const NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /[1-9]\d*/
})

const ColFunc = createToken({ name: "ColFunc", pattern: /col/ })
const Comma = createToken({ name: "Comma", pattern: /,/ })

// marking WhiteSpace as 'SKIPPED' makes the lexer skip it.
const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
})

const allTokens = [
    WhiteSpace, // whitespace is normally very common so it should be placed first to speed up the lexer's performance
    Add,
    Sub,
    Mul,
    Div,
    LParen,
    RParen,
    FloatLiteral,
    NumberLiteral,
    AdditionOperator,
    MultiplicationOperator,
    ColFunc,
    Comma,
    ColumnName,
    Identifier
]
const ExpressionLexer = new Lexer(allTokens)

// ----------------- parser -----------------
// Note that this is a Pure grammar, it only describes the grammar
// Not any actions (semantics) to perform during parsing.
class ExpressionParser extends CstParser {
    expression;
    additionExpression;
    multiplicationExpression;
    atomicExpression;
    parenthesisExpression;
    identifierExpression;
    columnNameExpression;
    colFunction;

    // Unfortunately no support for class fields with initializer in ES2015, only in esNext...
    // so the parsing rules are defined inside the constructor, as each parsing rule must be initialized by
    // invoking RULE(...)
    // see: https://github.com/jeffmo/es-class-fields-and-static-properties
    constructor() {
        super(allTokens)

        const $ = this

        $.RULE("expression", () => {
            $.SUBRULE($.additionExpression)
        })

        $.RULE("identifierExpression", () => {
            $.CONSUME(Identifier)
        })

        $.RULE("columnNameExpression", () => {
            $.CONSUME(ColumnName)
        })

        // Lowest precedence thus it is first in the rule chain
        // The precedence of binary expressions is determined by how far down the Parse Tree
        // The binary expression appears.
        $.RULE("additionExpression", () => {
            // using labels can make the CST processing easier
            $.SUBRULE($.multiplicationExpression, { LABEL: "lhs" })
            $.MANY(() => {
                // consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
                $.CONSUME(AdditionOperator)
                //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
                $.SUBRULE2($.multiplicationExpression, { LABEL: "rhs" })
            })
        })

        $.RULE("multiplicationExpression", () => {
            $.SUBRULE($.atomicExpression, { LABEL: "lhs" })
            $.MANY(() => {
                $.CONSUME(MultiplicationOperator)
                //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
                $.SUBRULE2($.atomicExpression, { LABEL: "rhs" })
            })
        })

        $.RULE("atomicExpression", () => {
            $.OR([
                // parenthesisExpression has the highest precedence and thus it appears
                // in the "lowest" leaf in the expression ParseTree.
                { ALT: () => $.SUBRULE($.parenthesisExpression) },
                { ALT: () => $.CONSUME(FloatLiteral) },
                { ALT: () => $.CONSUME(NumberLiteral) },
                { ALT: () => $.SUBRULE($.colFunction) }
            ])
        })

        $.RULE("parenthesisExpression", () => {
            $.CONSUME(LParen)
            $.SUBRULE($.expression)
            $.CONSUME(RParen)
        })

        $.RULE("colFunction", () => {
            $.CONSUME(ColFunc)
            $.CONSUME(LParen)
            $.SUBRULE($.columnNameExpression, { LABEL: "base" })
            $.CONSUME(RParen)
        })

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        this.performSelfAnalysis()
    }
}

const parser = new ExpressionParser();

export const BaseCstVisitor = parser.getBaseCstVisitorConstructor()
// wrapping it all together
// reuse the same parser instance.
export const parseExpression = function (expression){
    const lexResult = ExpressionLexer.tokenize(expression)

    parser.input = lexResult.tokens

    return parser.expression()
}
