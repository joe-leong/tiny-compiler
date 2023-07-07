/**
 *                  LISP                      C
 *
 *   2 + 2          (add 2 2)                 add(2, 2)
 *   4 - 2          (subtract 4 2)            subtract(4, 2)
 *   2 + (4 - 2)    (add 2 (subtract 4 2))    add(2, subtract(4, 2))
 */
/**
 * 词法分析
 * (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
 * @param {string} input
 */
function tokenizer(input) {
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });
      current++;
      continue;
    }
    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      current++;
      continue;
    }

    // 匹配空格,直接跳过
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // 匹配数字
    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value,
      });
      continue;
    }

    // 匹配字符串
    if (char === '"') {
      let value = "";
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      // 跳到下一个字符
      char = input[++current];
      tokens.push({
        type: "string",
        value,
      });
      continue;
    }

    // 匹配操作符
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "name",
        value,
      });
      continue;
    }

    // 错误捕获
    throw new TypeError("I dont know what this character is: " + char);
  }
  return tokens;
}

/**
 * 语法分析
 * [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 * @param {array} tokens
 */
function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }
    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value,
      };
    }
    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      let node = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    // 错误处理
    throw new TypeError(token.type);
  }
  // 构造ast结构
  let ast = {
    type: "Program",
    body: [],
  };
  while (current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
}

/**
 * 添加观察者？
 * @param {object} ast
 * @param {object} visitor
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }
  function traverseNode(node, parent) {
    let methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;
      case "CallExpression":
        traverseArray(node.params, node);
        break;
      case "NumberLiteral":
      case "StringLiteral":
        break;
      default:
        // 错误处理
        throw new TypeError(node.type);
    }
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }
  traverseNode(ast, null);
}

/**
 * ast转换
 * @param {object} ast
 */
function transformer(ast) {
  let newAst = {
    type: "Program",
    body: [],
  };
  ast._context = newAst.body;
  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
        };
        node._context = expression.arguments;
        if (parent.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression: expression,
          };
        }
        parent._context.push(expression);
      },
    },
  });
  return newAst;
}

/**
 * 代码生成
 * @param {object} node
 */
function codeGenerator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("\n");
    case "CallExpression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(",") +
        ")"
      );
    case "ExpressionStatement":
      return codeGenerator(node.expression) + ";";
    case "Identifier":
      return node.name;
    case "NumberLiteral":
      return node.value;
    case "StringLiteral":
      return '"' + node.value + '"';
    default:
      throw new TypeError(node.type);
  }
}

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator
};
