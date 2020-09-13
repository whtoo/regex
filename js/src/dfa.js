const { toNFA } = require('./nfa')
const { insertExplicitConcatOperator,toPostfix } = require('./parser');
let DFAID = 0;

function createDFAState(isEnd) {
    return {
        isEnd,
        nfaStateSet: [],
        transitions: {},
        label:DFAID++
    };
}

function epsilonCleen(state){
    //  BFS
    let espilonSet = [state];
    let queue = [state];
    while(queue.length > 0){
        let q = queue.shift();
        for(const st of q.epsilonTransitions){
            if(espilonSet.findIndex(val => st.label === val.label) === -1){
                queue.push(st);
                espilonSet.push(st)
                if(st.isEnd) state.isEnd = st.isEnd
            }
        }
    }

    return espilonSet;
}
/**
 *  
 * @param {} dfaState 
 */
function epsilonCleenDelta(state,ch) {
    let tmpSet = [];
    let dfaState = createDFAState(false);

    for(const st of state.nfaStateSet){
        if(st.transitions[ch] != undefined) {
            const newStates = epsilonCleen(st.transitions[ch]);
            for(const tmpSt of newStates){
                if(tmpSet.findIndex(val => val.label === tmpSt.label) === -1){
                    tmpSet.push(tmpSt);
                    if(tmpSt.isEnd) dfaState.isEnd = tmpSt.isEnd;
                }
            }
        }
    }
    if(tmpSet.length > 0){
        dfaState.nfaStateSet = tmpSet;
    } else {
        dfaState = null;
    }
   
    return dfaState;
}

function toDFA(exp) {
    let aplhabets = new Set();
    for(const ch of exp){
        if(ch !== "(" && ch !== "." && ch !== "?" && ch !== ")" && ch !== "*" && ch !== "|") {
            aplhabets.add(ch)
        }
    }
    // for(let i = 0; i < 26;i++){
    //     let upper = (0x41 + i);
    //     let lower = upper + 0x20;
    //     aplhabets.push(String.fromCharCode(upper));
    //     aplhabets.push(String.fromCharCode(lower));
    // }
    const transExp = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(transExp);
    let nfa = toNFA(postfixExp);
    //1. 从初始状态开始，进行下一状态等价集合的构造
    let q0 = createDFAState(false);
    q0.nfaStateSet = epsilonCleen(nfa.start);
    q0.isEnd = nfa.start.isEnd;

    let workLst = new Array();
    let dfaStates = [q0];
    workLst.push(q0);
    // isEnd,
    // nfaStateSet: [],
    // transitions: []
    while(workLst.length > 0){
        let q = workLst.shift();
        for(const ch of aplhabets) {
            // 计算delta并合并进入新状态
            t = epsilonCleenDelta(q,ch);
            if(t != null) {
                if(!dfaStatesHas(dfaStates,t)){
                    dfaStates.push(t);
                    workLst.push(t);
                    q.transitions[ch] = t
                } else {
                    let node = dfaStatesFind(dfaStates,t);
                    node.isEnd = t.isEnd;
                    q.transitions[ch] = node;
                }
            }
        }
    }
    return q0;
}
function dfaStatesFind(dfaSets,state){
    for(const st of dfaSets) {
        if(dfaStateEqual(st,state)) return st;
    }

    return undefined;
}
function dfaStatesHas(dfaSets,state) {
    for(const st of dfaSets) {
        if(dfaStateEqual(st,state)) return true;
    }

    return false;
}
function dfaStateEqual(d1,d2){

    if(d1.nfaStateSet.length !== d2.nfaStateSet.length ) return false;

    for(const st of d1.nfaStateSet){
        let ret = d2.nfaStateSet.find(cmp => {
            if(cmp.label === st.label){
                return true;
            } else {
                return false;
            }
        })
        if(ret == undefined) return false;
    }

    return true
}
function dfaToGraph(dfa) {
    /// BFS travel dfa
    let queue = [dfa];
    let visitedEdges = new Set();
    let graph = "digraph G {\n";
    graph += "rankdir = LR;\n";
    graph += "size = \"8,5\";\n";
    graph += "node [shape=circle];\n";
    while(queue.length > 0){
        let node = queue.shift();
        for(const ch in node.transitions){
            let n2 = node.transitions[ch];
            if(!visitedEdges.has(n2.label+ch+node.label)){
                visitedEdges.add(n2.label+ch+node.label)
                graph += `LR_${node.label} -> LR_${n2.label} [label="${ch}"] ;\n`
                queue.push(n2);
            }
        }
    }
    graph += "\n}"
    return graph;
}
function dfaSearch(dfa,word) {
    let currentState = dfa;

    for(const ch of word) {
        currentState = currentState.transitions[ch]
        if(currentState == undefined) return false
    }
    
    if(currentState == undefined) return false

    return currentState.isEnd == true
}

module.exports = {
    toDFA,
    dfaSearch,
    dfaToGraph
}