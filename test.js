const { tokenizer,parser} = require('./core')
const input = '(add 2 (subtract 4 2))';

let tokens = tokenizer(input)
let ast = parser(tokens)

console.log(JSON.stringify(ast));
