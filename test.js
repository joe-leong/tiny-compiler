const { tokenizer, parser, transformer, codeGenerator } = require("./core");
const input = "(add 2 (subtract 4 2))";

let tokens = tokenizer(input);
let ast = parser(tokens);
let newAst = transformer(ast);
let ouput = codeGenerator(newAst)

console.log(JSON.stringify(ouput));
