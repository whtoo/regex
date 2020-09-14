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

function minimizeDFA(dfa) {
    //1. 将dfa分为 N 和 A 两个集合。
    //1.1 定义等价状态
    let unAcceptSet = new Set();
    let acceptSet = new Set();
    let visitedEdges = new Set();
    let queue = [dfa];
    let states = new Map();
    while(queue.length > 0){
        let currentState = queue.shift();
        currentState.nfaStateSet = []
        for(const ch in currentState.transitions){
            const dest = currentState.transitions[ch];
            const edge = `LR_${currentState.label}--${ch}-->LR_${dest}`
            if(!visitedEdges.has(edge)){
                visitedEdges.add(edge);
                queue.push(dest);
            }
            //标记当前状态
            tagState(currentState,acceptSet,unAcceptSet);
            states.set(currentState.label,currentState);
        }
    }
    // 重新编码dfa的label
    let newId = 0;
    let totalSet = new Set(unAcceptSet);

    for(const label of acceptSet){
        totalSet.add(label);
    }

    for(const label of totalSet){
        const state = states.get(label);
        state.label = newId++;
    }
    let diff = new Array(newId)
    diff.forEach(val => new Array(newId).fill(0));
    let sIdx = new Map();

    //1.划分正式开始

    
    return dfa;
}

function tagState(state,acceptSet,unAcceptSet){
    if(state.isEnd){
        if(!acceptSet.has(state.label)){
            acceptSet.add(state.label);
        }
    } else if(!unAcceptSet.has(state.label)){
        unAcceptSet.add(state.label)
    }
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
    let acceptStateTags = new Set();
    let graph = "digraph G {\n";
    graph += "rankdir = LR;\n";
    graph += "size = \"8,5\";\n";
    graph += "node [shape=circle];\n";
    while(queue.length > 0){
        let node = queue.shift();
        if(node == dfa) {
            graph += `LR_${node.label} [style=filled,fillcolor = blue]\n`
        }
        for(const ch in node.transitions){
            let n2 = node.transitions[ch];
            if(!visitedEdges.has(n2.label+ch+node.label)){
                visitedEdges.add(n2.label+ch+node.label)
                if(node.isEnd && !acceptStateTags.has(node.label)) {
                    graph += `LR_${node.label} [shape=doublecircle,style=filled,fillcolor = blue];\n`
                    acceptStateTags.add(node.label);
                }
                graph += `LR_${node.label} -> LR_${n2.label} [label="${ch}"];\n`
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
    dfaToGraph,
    minimizeDFA
}