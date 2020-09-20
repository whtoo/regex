function insertExplicitConcatOperator(exp) {
    let output = '';
    for(let i = 0; i < exp.length; i++){
        const token = exp[i];
        output += token;

        if(token === '(' || token === '|') {
            continue;
        }

        if(i < exp.length - 1) {
            const lookahead = exp[i + 1];
            
            if(lookahead === '*' || lookahead === '?' || lookahead === '+' || lookahead === ')' || lookahead === '|'){
                continue;
            }

            output += '.';
        }
    }
    return output;
}

function peek(stack) {
    return stack.length && stack[stack.length-1];
}
const operatorPrecedence = {
    '|': 0,
    '.': 1,
    '?': 2,
    '*': 2,
    '+': 2
}
/**
 * 
 * @param {*} exp 
 * etc: c+(ac|b)* --> c+acb|*.
 */
function toPostfix(exp) {
    let output = '';
    const operatorStack = [];

    for(const token of exp) {
        if(token === '(') {
            operatorStack.push(token);
        } else if(token === ')') {
            while(peek(operatorStack) !== '(') {
                output += operatorStack.pop()
            }
            operatorStack.pop();
        } else if(token === '.' || token === '|' || token === '?' || token === '*' || token === '+') {
            let top = peek(operatorStack);
            while (operatorStack.length && top !== '('
            && operatorPrecedence[top] >= operatorPrecedence[token]) {
                output += operatorStack.pop();
                top = peek(operatorStack)
            }
            operatorStack.push(token);
        } else {
            /// operand
            output += token;
        }
    }
    while(operatorStack.length) {
        output += operatorStack.pop();
    }
    return output;
}


module.exports = {
    insertExplicitConcatOperator,
    toPostfix
}