const { toNFA, search } = require('./nfa');
const { insertExplicitConcatOperator,toPostfix } = require('./parser');

function createNFAMatcher(exp) {
    const transExp = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(transExp);
    const nfa = toNFA(postfixExp);

    return word => search(nfa, word);
}

function createDFAMatcher(exp) {

}

module.exports = {
    createNFAMatcher,
    createDFAMatcher
}