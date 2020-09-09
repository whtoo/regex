const { toNFA } = require('./nfa')
const { insertExplicitConcatOperator,toPostfix } = require('./parser');

function createDFAState(isEnd) {
    return {
        isEnd,
        nfaStateSet: [],
        transitions: {}
    };
}

function epsilonCleen(state){
    //  BFS
    let espilonSet = [];
    let queue = [state];
    while(queue.length > 0){
        let q = queue.shift();
        espilonSet.push(q)
        for(const st of q.epsilonTransitions){
            if(!espilonSet.find(val => st === val)){
                queue.push(st);
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
                if(!tmpSet.find(val => val === tmpSt)){
                    tmpSet.push(tmpSt);
                    if(!dfaState.isEnd && tmpSt.isEnd) dfaState.isEnd = tmpSt.isEnd;
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
    let aplhabets = [
        'a','b','c'
    ];
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
                    q.transitions[ch] = dfaStatesFind(dfaStates,t);
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
            for(const n1 of cmp.epsilonTransitions) {
                if(!st.epsilonTransitions.find(n2 => n1.label === n2.label)) return undefined
            }
            for(const [key,val] in cmp.transitions) {
                if(st.transitions[key] !== val) return undefined;
            }
            return cmp;
        })
        if(ret == undefined) return false;
    }

    return true
}

function dfaSearch(dfa,word) {
    let currentState = dfa;

    for(const ch of word) {
        currentState = currentState.transitions[ch]
    }

    return currentState.isEnd == true
}

module.exports = {
    toDFA,
    dfaSearch
}