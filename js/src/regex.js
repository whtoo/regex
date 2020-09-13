const { toNFA, nfaSearch,nfaToGraph } = require('./nfa');
const { insertExplicitConcatOperator,toPostfix } = require('./parser');
const { toDFA, dfaSearch,dfaToGraph } = require('./dfa');

function createNFAMatcher(exp) {
    const transExp = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(transExp);
    const nfa = toNFA(postfixExp);
    console.log(nfaToGraph(nfa));
    return word => nfaSearch(nfa, word);
}

function createDFAMatcher(exp) {   
    const dfa = toDFA(exp);
    console.log(dfaToGraph(dfa));
    return word => dfaSearch(dfa,word);
}

module.exports = {
    createNFAMatcher,
    createDFAMatcher
}