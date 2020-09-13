const { createNFAMatcher,createDFAMatcher } = require('./regex')
const match = createDFAMatcher('d?c*(a|b)*(b|c+)');
const match2 = createNFAMatcher('d?c*(a|b)*(b|c+)');
console.log(match("bb"));
