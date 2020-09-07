const { insertExplicitConcatOperator,toPostfix } = require('./parser')

function createState(isEnd) {
    return {
        isEnd,
        transition: {},
        epsilonTransitions: []
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
    from.transition[symbol] = to;
}
//        ε
// start --> end
function fromEpsilon() {
    const start = createState(false);
    const end = createState(true);
    addEpsilonTransition(start, end);
    return { start, end };
}

function fromSymbol(symbol) {
    const start = createState(false);
    const end = createState(true);
    addTransition(start, end, symbol);

    return { start, end };
}

function concat(first, second) {
    addEpsilonTransition(first.end, second.start);
    first.end.isEnd = false;

    return { start: first.start, end: second.end };
}

function union(first, second) {
    const start = createState(false);
    addEpsilonTransition(start, first.start);
    addEpsilonTransition(start, second.start);

    const end = createState(true);
    addEpsilonTransition(first.end, end);
    first.end.isEnd = false;
    addEpsilonTransition(second.end, end);
    second.end.isEnd = false;

    return { start, end };
}

function closure(nfa) {
    const start = createState(false);
    const end   = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}

function zeroOrOne(nfa) {
    const start = createState(false);
    const end = createState(true);
    addEpsilonTransition(start,end);
    addEpsilonTransition(start,nfa.start);

    addEpsilonTransition(nfa.end,end);
    nfa.end.isEnd = false;

    return { start, end };
}

function oneMore(nfa) {
    const start = createState(false);
    const end = createState(true);
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
function search(nfa,word) {
   
    let currentStates = [];
    addNextState(nfa.start,currentStates,[]);

    for (const symbol of word){
        const nextStates = [];
        for (const state of currentStates) {
            const nextState = state.transition[symbol];

            if (nextState) {
                addNextState(nextState, nextStates, []);
            }
        }
        currentStates = nextStates;
    }
  
    return currentStates.find(s => s.isEnd)? true : false;
}

module.exports = {
    search,
    toNFA
}