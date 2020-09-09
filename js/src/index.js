const { createNFAMatcher,createDFAMatcher } = require('./regex')
const match = createDFAMatcher('(a|b)*c');

console.log(match("d"));