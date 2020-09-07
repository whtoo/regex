const { createMatcher } = require('./regex')
const match = createMatcher('(a|b)*c');

match("ac");