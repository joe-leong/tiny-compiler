const { tokenizer} = require('./core')
const input = '(add 2 (subtract 4 2))';

let tokens = tokenizer(input)

// console.log(tokens);