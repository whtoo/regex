package org.blitz.regex;

public class NFA {
    private State start;
    private State end;

    public NFA(State ss,State es){
        this.start = ss;
        this.end = es;
    }

    @Override
    public int hashCode() {
        return (this.start.toString() + this.end.toString()).hashCode() ;
    }

    /**
     * n1 . n2
     * @param n1
     * @param n2
     */
    public NFA concat(NFA n1,NFA n2){
        // TODO concat
        return n1;
    }

    /**
     * n1*
     * @param n1
     */
    public NFA cleen(NFA n1){
        // TODO cleen
        return n1;
    }
    /**
     * n1 | n2
     * @param n1
     * @param n2
     * @return
     */
    public NFA or(NFA n1,NFA n2) {
        // TODO or
        return n1;
    }

    /**
     * n1?
     * @param n1
     */
    public NFA option(NFA n1) {
        // TODO option
        return n1;
    }


}
