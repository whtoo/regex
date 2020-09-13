const { createNFAMatcher,createDFAMatcher } = require('./regex')
const match = createDFAMatcher('(0|(1(01*(00)*0)*1)*)*');
console.log(match("0"));
