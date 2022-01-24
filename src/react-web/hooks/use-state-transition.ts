import React from 'react';
import { AnyEventObject, Event, EventObject, State, StateSchema, StateValue, Typestate } from 'xstate';

export type StateTransitionEffect<
  TState extends State<any>, 
> = (current: TState, previous?: TState) => void;

export type StateTransitionOptions<
  TState extends State<any>, 
> = {
  in?: StateTransitionEffect<TState>,
  out?: StateTransitionEffect<TState>
};


export function useStateTransition<
  TState extends State<any, any>
>(state: TState | undefined, matches: StateValue, options: StateTransitionOptions<TState>) {
  const { in: inFn, out: outFn } = options;
  const prevStateRef = React.useRef<TState | undefined>();
  const prevState = prevStateRef.current;

  React.useEffect(() => {
    if (state && state.matches(matches) && !prevState?.matches(matches))
      inFn?.(state, prevState);
    else if (state && !state.matches(matches) && prevState?.matches(matches))
      outFn?.(state, prevState);

    prevStateRef.current = state;
  }, [state]);
}
