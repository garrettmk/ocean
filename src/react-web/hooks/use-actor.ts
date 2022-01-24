import React from 'react';
import { ActorRef, EventObject, Sender } from 'xstate';


export function useActor<TEvent extends EventObject, TEmitted = any>(actorRef?: ActorRef<TEvent, TEmitted>)
{
  // Hold the last emitted state
  const [state, setState] = React.useState(() => actorRef?.getSnapshot());
  // Send events to the actor
  const send = actorRef?.send;

  // When actorRef changes, unsubscribe from the old
  // actor and subscribe to the new one
  React.useEffect(() => {
    const subscription = actorRef?.subscribe(setState);
    setState(actorRef?.getSnapshot());

    return () => {
      subscription?.unsubscribe();
    };
  }, [actorRef]);

  return state && send ? { state, send } : undefined;
}