package org.blitz.regex;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class State {
    static Integer IDGENERATOR = 0;
    Integer id;
    List<State> epsilonTransitions;
    Map<String,State> transitions;
    Boolean isEnd;
    
    public State() {
        this.id = State.IDGENERATOR++;
        this.isEnd = false;
        this.epsilonTransitions = new ArrayList<>();
        this.transitions = new HashMap<>();
    }

    public static void resetIDGenerator() {
        State.IDGENERATOR = 1;
    }

    @Override
    public int hashCode() {
        int hashCode = this.id & 17;
        hashCode ^= this.epsilonTransitions.hashCode();
        hashCode ^= this.transitions.hashCode();
        return hashCode;
    }

    public void addEpsilonTransition(State st){
        this.epsilonTransitions.add(st);
    }

    public void addTransition(String key,State st){
        this.transitions.put(key, st);
    }
}