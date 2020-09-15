const { createNFAMatcher,createDFAMatcher } = require('./regex')
const { toDFA,dfaToGraph,createDFAState,minimizeDFA} = require('./dfa')
var fs = require('fs');
var process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// let A = createDFAState(false);
// let B = createDFAState(true);
// let C = createDFAState(true);
// let D = createDFAState(false);
// let E = createDFAState(false);
// let F = createDFAState(true);
// let G = createDFAState(true);

// A.transitions = {
//     'b':B,
//     'c':C,
//     'd':D
// };
// C.transitions = {
//     'a':E,
//     'b':F,
//     'c':G
// };
// D.transitions = {
//     'b':B,
//     'c':C
// }
// E.transitions = {
//     'a':E,
//     'b':F,
//     'c':C
// }
// F.transitions = {
//     'a':E,
//     'b':F,
//     'c':C
// }
// G.transitions = {
//     'a':E,
//     'b':F,
//     'c':G
// }
let dfa = toDFA('(a|b)(a|b*)');
let minDFA = minimizeDFA(dfa);

function saveGraph(input,suffix){
    let graph = dfaToGraph(input)
    console.log(graph);
    let name = `./dfa_${suffix}`
    fs.writeFileSync(`./${name}.dot`,graph);
    
    async function dotGenerate() {
      try {
          const { stdout, stderr } = await exec(`dot -Tpng -o ${name}.png ${name}.dot && open ${name}.png`);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
      }catch (err) {
         console.error(err);
      };
    };
    dotGenerate();
}
saveGraph(dfa,'n');
saveGraph(minDFA,'min');