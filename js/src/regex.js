const { toNFA, nfaSearch } = require('./nfa');
const { insertExplicitConcatOperator,toPostfix } = require('./parser');
const { toDFA, dfaSearch } = require('./dfa');

function createNFAMatcher(exp) {
    const transExp = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(transExp);
    const nfa = toNFA(postfixExp);

    return word => nfaSearch(nfa, word);
}

function createDFAMatcher(exp) {   
    const dfa = toDFA(exp);
    return word => dfaSearch(dfa,word);
}

module.exports = {
    createNFAMatcher,
    createDFAMatcher
}