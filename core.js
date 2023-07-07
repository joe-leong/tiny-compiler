
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
    let current = 0
    let tokens = []
    while (current < input.length) {
        let char = input[current]
        if (char === '(') {
            tokens.push({
                type: 'paren',
                value:'('
            })
            current++
            continue
        }
        if (char === ')') {
            tokens.push({
                type: 'paren',
                value:')'
            })
            current++
            continue
        }

        // 匹配空格,直接跳过
        let WHITESPACE = /\s/
        if (WHITESPACE.test(char)) {
            current++
            continue
        }

        // 匹配数字
        let NUMBERS = /[0-9]/
        if (NUMBERS.test(char)) {
            let value = ''
            while (NUMBERS.test(char)) {
                value += char
                char = input[++current]
            }
            tokens.push({
                type: 'number',
                value
            })
            continue
        }

        // 匹配字符串
        if (char === '"') {
            let value = ''
            char = input[++current]
            while (char !== '"') {
                value += char
                char = input[++current]
            }
            // 跳到下一个字符
            char = input[++current]
            tokens.push({
                type: 'string',
                value
            })
            continue
        }

        // 匹配操作符
        let LETTERS = /[a-z]/i
        if (LETTERS.test(char)) {
            let value = ''
            while (LETTERS.test(char)) {
                value += char
                char = input[++current]
            }
            tokens.push({
                type: 'name',
                value
            })
            continue
        }

        // 错误捕获
        throw new TypeError('I dont know what this character is: ' + char);
    }
    return tokens
}


/**
 * 语法分析
 * @param {array} tokens 
 */
function parser(tokens) {
    
}

module.exports = {
    tokenizer,
    parser
}
