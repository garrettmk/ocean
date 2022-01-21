import { useMachine } from "@xstate/react";
import { useServices } from "../services";
import React from 'react';
import { makeGraphEditorMachine, GraphEditorContext } from "@/client/machines";


export function useGraphEditorMachine(initialContext?: GraphEditorContext) {
  const services = useServices();
  const machine = React.useMemo(() => makeGraphEditorMachine(services.documents, initialContext), []);
  const [state, send] = useMachine(machine);

  return {
    state,
    send
  };
}