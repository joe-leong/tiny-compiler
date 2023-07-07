const { tokenizer,parser,transformer} = require('./core')
const input = '(add 2 (subtract 4 2))';

let tokens = tokenizer(input)
let ast = parser(tokens)
let newAst = transformer(ast)

console.log(JSON.stringify(newAst));
