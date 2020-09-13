const { insertExplicitConcatOperator,toPostfix } = require('./parser')

let NFALABEL = 0;

function createNFAState(isEnd) {

    return {
        isEnd,
        transitions: {},
        epsilonTransitions: [],
        label:NFALABEL++
    };
}

//      ε
// from -> to
function addEpsilonTransition(from,to) {
    from.epsilonTransitions.push(to);
}

//      a
// from -> to
function addTransition(from,to,symbol) {
    from.transitions[symbol] = to;
}
//        ε
// start --> end
function fromEpsilon() {
    const start = createNFAState(false);
    const end = createNFAState(true);
    addEpsilonTransition(start, end);
    return { start, end };
}

function fromSymbol(symbol) {
    const start = createNFAState(false);
    const end = createNFAState(true);
    addTransition(start, end, symbol);

    return { start, end };
}

function concat(first, second) {
    addEpsilonTransition(first.end, second.start);
    first.end.isEnd = false;

    return { start: first.start, end: second.end };
}

function union(first, second) {
    const start = createNFAState(false);
    addEpsilonTransition(start, first.start);
    addEpsilonTransition(start, second.start);

    const end = createNFAState(true);
    addEpsilonTransition(first.end, end);
    first.end.isEnd = false;
    addEpsilonTransition(second.end, end);
    second.end.isEnd = false;

    return { start, end };
}

function closure(nfa) {
    const start = createNFAState(false);
    const end   = createNFAState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}

function zeroOrOne(nfa) {
    const start = createNFAState(false);
    const end = createNFAState(true);
    addEpsilonTransition(start,end);
    addEpsilonTransition(start,nfa.start);

    addEpsilonTransition(nfa.end,end);
    nfa.end.isEnd = false;

    return { start, end };
}

function oneMore(nfa) {
    const start = createNFAState(false);
    const end = createNFAState(true);
    addEpsilonTransition(start,nfa.start);
    addEpsilonTransition(nfa.end,nfa.start);
    addEpsilonTransition(nfa.end,end);
    nfa.end.isEnd = false;

    return { start, end };
}

function toNFA(postfixExp) {
    if(postfixExp === ''){
        return fromEpsilon();
    }

    const stack = [];
    for (const token of postfixExp) {
        if(token === '*'){
            stack.push(closure(stack.pop()));
        } 
        else if(token === '?') { 
            stack.push(zeroOrOne(stack.pop()));
        }
        else if(token === '+') { 
            stack.push(oneMore(stack.pop()));
        }
        else if(token === '|') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(union(left,right));
        } else if(token === '.') {
            const right = stack.pop();
            const left  = stack.pop();
            stack.push(concat(left,right));
        } else{
            stack.push(fromSymbol(token));
        }
    }

    return stack.pop();
}
// 
function addNextState(state, nextStates, visited) {
    if (state.epsilonTransitions.length) {
        for (const st of state.epsilonTransitions) {
            if (!visited.find(vs => vs === st)) {
                visited.push(st);
                addNextState(st, nextStates, visited);
            }
        }
    } else {
        nextStates.push(state);
    }
}

function nfaToGraph(nfa) {
    /// BFS travel nfa
    let queue = [nfa.start];
    let visitedEdges = new Set();
    let acceptStatesTag = new Set();
    let epsilon = 'ℇ';
    let graph = "digraph G {\n";
    graph += "rankdir = LR;\n";
    graph += "size = \"8,5\";\n";
    graph += "node [shape=circle];\n";
    
    while(queue.length > 0){
        let node = queue.shift();
        if(node == nfa.start){
            graph += `LR_${node.label} [style=filled,fillcolor = blue];\n`
        }

        if(node.isEnd && !acceptStatesTag.has(node.label)){
            graph += `LR_${node.label} [shape=doublecircle,style=filled,fillcolor = blue];\n`
            acceptStatesTag.add(node.label);
        }
        for(const n1 of node.epsilonTransitions){
            if(!visitedEdges.has(n1.label+epsilon+node.label)){
                visitedEdges.add(n1.label+epsilon+node.label)
                
                graph += `LR_${node.label} -> LR_${n1.label} [label="${epsilon}"] ;\n`
                queue.push(n1);
            }
        }
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

function nfaSearch(nfa,word) {
   
    let currentStates = [];
    addNextState(nfa.start,currentStates,[]);

    for (const symbol of word){
        const nextStates = [];
        for (const state of currentStates) {
            const nextState = state.transitions[symbol];

            if (nextState) {
                addNextState(nextState, nextStates, []);
            }
        }
        currentStates = nextStates;
    }
  
    return currentStates.find(s => s.isEnd)? true : false;
}

module.exports = {
    nfaSearch,
    toNFA,
    nfaToGraph
}