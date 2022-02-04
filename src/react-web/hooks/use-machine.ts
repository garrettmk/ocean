import React from 'react';
import { interpret, StateMachine, Interpreter, EventObject, StateSchema, Typestate } from 'xstate';
import { useUpdate } from 'react-use';


export function useMachine<C, S extends StateSchema, E extends EventObject, T extends Typestate<C>, A extends any[]>
(machineFn: (...args: A) => StateMachine<C, S, E, T>, ...machineFnArgs: A) : Interpreter<C, S, E, T> {
  const update = useUpdate();
  return React.useMemo(() => {
    const machine = machineFn(...machineFnArgs);
    const service = interpret(machine);
    service.onTransition(update);
    service.start();
    return service;
  }, []);
}