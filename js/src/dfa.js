const { toNFA } = require('./nfa')
const { insertExplicitConcatOperator,toPostfix } = require('./parser');
const { ArrayList } = require('./arraylist');
let DFAID = 0;

class Group extends ArrayList {
    /**
     * 
     * @param {Group} g 
     * @param {Number} i 
     */
    constructor(g,i){
        super();
        this.id = i;
        if(g != null && g != undefined){
            for(let i = 0;i < g.size();i++){
                const st = g.get(i);
                this.add(st);
            }
        }
    }

    add(ele){
        if(super.contains(ele)) return true;
        return super.add(ele);
    }

    get id() {
        return this.idx;
    }

    set id(i) {
        this.idx = i;
    }
}
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

function minimizeDFA(start) {
    //1. 将dfa分为 N 和 A 两个集合。
    //1.1 定义等价状态
    let unAcceptSet = new Group(null,1);
    let acceptSet = new Group(null,0);
    let visitedNodes = new Set();
    let queue = [start];
    let states = new Map();
    while(queue.length > 0){
        let currentState = queue.shift();
        currentState.nfaStateSet = []
        states.set(currentState.label,currentState);
        //标记当前状态
        tagState(currentState,acceptSet,unAcceptSet);
        for(const ch in currentState.transitions){
            const dest = currentState.transitions[ch];
            if(!visitedNodes.has(dest.label)){
                visitedNodes.add(dest.label);
                queue.push(dest);
            }
            
        }
    }
    // 重新编码dfa的label
    let newId = 0;
    let totalSet = new ArrayList();
    for(let i = 0;i < unAcceptSet.size();i++){
        const label = unAcceptSet.get(i);
        totalSet.add(label);
    }
    for(let i = 0;i < acceptSet.size();i++){
        const label = acceptSet.get(i);
        totalSet.add(label);
    }
    acceptSet.clear();
    unAcceptSet.clear();
    let newStates = new Map();
    for(let i = 0;i < totalSet.size();i++){
        const label = totalSet.get(i);
        const state = states.get(label);
        state.label = newId++;
        newStates.set(state.label,state);
        if(state.isEnd) acceptSet.add(state.label);
        else unAcceptSet.add(state.label);
    }
    states = newStates;
    let diff = new Array(newId)
    diff.forEach(val => new Array(newId).fill(0));
    //1.划分正式开始
    /**
     * @param {[Group]}
     */
    let groups = new Array();
    groups.push(acceptSet);
    groups.push(unAcceptSet);
    groups = removeUnreachableStates(groups,states,0);
    groups = minimize(groups,states);
    //map all different groups to a specific integer that is there id
    let map = new Map();
    let idx = 0;
    newStates = new Array();
    for (const g of groups) {
        let isEnd = false
        for (let i=0;i < g.size();i++) {
            let s = states.get(g.get(i));
            if(s.isEnd) {
                isEnd = s.isEnd
            }
            map.set(s.label, idx);
        }
        let newSt = createDFAState(isEnd);
        newSt.label = idx;
        newStates.push(newSt);
        idx++;
    }

    //store all the set of transitions after minimization
    let trans = new Set();
    for (const g of groups) {
        for (let i = 0;i < g.size();i++) {
            let s = states.get(g.get(i));
            for(const key in s.transitions){
                const dest = s.transitions[key];
                if(!trans.has(map.get(s.label) + ":"+key+":" + map.get(dest.label))){
                    trans.add(map.get(s.label) + ":"+key+":" + map.get(dest.label));
                }
            }
        }
    }

    for(const tr of trans){
        let comp = tr.split(':');
        let src = parseInt(comp[0]);
        let dest = parseInt(comp[2]);
        newStates[src].transitions[comp[1]] = newStates[dest];
    }

    return newStates[map.get(start.label)];
}
/**
 * 
 * @param {[Group<Number>]} groups 
 * @param {Map<Number,Object>} states
 */
function minimize(groups,states) {

    //list of groups after division of groups
    let result = new Array();
    let idx = 0;

    for (let g of groups) { //for all Group g in groups
        if (g.size() > 1) {
            for (let i = 0; i < g.size(); i++) {

                /*
                 * if the result group already contains the current
                  * group then we need not to check it
                 */
                if (containsState(result, g.get(i))) {
                    continue;
                }

                /*
                 * a new group to store states that are
                 * not unique among the current group g
                 */
                let new_group = new Group(null,idx++);
                new_group.add(g.get(i));

                for (let j = i + 1; j < g.size(); j++) {

                    let state1 = g.get(i);
                    let state2 = g.get(j);

                    /*
                     * if any two states in the same group are not unique
                     * then add the second state to a new group
                     */
                    if (!areStatesUnique(groups, states.get(state1), states.get(state2))) {
                        new_group.add(state2);
                    }
                }

                //add the new group to the result
                result.push(new_group);
            }
        }
        //when the group contains only one state
        else {
            result.push(new Group(g, idx++));
        }
    }

    // if already minimized
    if (groups.length == result.length) return result;

    // minimize further
    return minimize(result,states);
}
 /*
    * A function to check wheather given
    * two states are unique or not
    * */
   function areStatesUnique(groups,state1,state2) {
    let keyST1 = new Set(Object.keys(state1.transitions))
    let keyST2 = new Set(Object.keys(state2.transitions))
    if(keyST1.size !== keyST2.size){
        return true
    }
    for(const k of keyST1){
        if(!keyST2.has(k)) return true
    }
    for (const ch in state1.transitions) {
        let s = state1.transitions[ch];
        let q = state2.transitions[ch];
        // Same input but different target
        if(q == undefined) return true

        if (!containedBySameGroup(groups, s,q)) {
            return true;
        }
    }
    return false;

}

/*
* returns true if the given state is in the given list of groups
* */
/**
 * 
 * @param {[Group]} groups 
 * @param {Number} state 
 */
function containsState( groups, state) {
    for (const g of groups) {
        if (g.contains(state)) return true;
    }
    return false;
}

/*
* returns true if both the given states are in the same group
*
* Note - HashSet<State> s contains a single state only
*       A set of states was only created for the sake of calculation for NFAs
* */
/**
 * 
 * @param {[Group]} groups 
 * @param {Object} s1 
 * @param {Object} s2 
 */
function containedBySameGroup(groups,  s1, s2) {
    for (const g of groups) {
        if (g.contains(s1.label) && g.contains(s2.label)) {
            return true;
        }
    }
    return false;
}
/**
 * 
 * @param {Array<Group>} groups 
 * @param {Map} dfa 
 * @param {Number} start 
 */
function removeUnreachableStates(groups,dfa,start){
    let reachable = new Array(dfa.length).fill(false);
    reachable[start] = true;
    let queue = [];
    queue.push(dfa.get(start));
    while(queue.length > 0) {
        let st = queue.shift();
        for(const ch in st.transitions){
            let nextState = st.transitions[ch];
            if(!reachable[nextState.label]){
                queue.push(nextState);
                reachable[nextState.label] = true;
            }
        }
    }

    for(let i = 0;i < dfa.size;++i){
        if(!reachable[i]){
            for(const g of groups){
                g.remove(dfa.get(i).label);
            }
        }
    }

    return groups;
}
function tagState(state,acceptSet,unAcceptSet){
    if(state.isEnd){
        acceptSet.add(state.label);
    } else {
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
        if(node.label === dfa.label && !node.isEnd) {
            graph += `LR_${node.label} [style=filled,fillcolor = blue]\n`
        }

        if(node.isEnd && !acceptStateTags.has(node.label)) {
            graph += `LR_${node.label} [shape=doublecircle,style=filled,fillcolor = blue];\n`
            acceptStateTags.add(node.label);
        }

        for(const ch in node.transitions){
            let n2 = node.transitions[ch];
            if(!visitedEdges.has(node.label+ch+n2.label)){
                visitedEdges.add(node.label+ch+n2.label)
               
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
    minimizeDFA,
    createDFAState
}