import { useMachine } from "@xstate/react";
import { useServices } from "../services";
import React from 'react';
import { makeGraphEditorMachine, GraphEditorContext } from "@/client/viewmodels";


export function useGraphEditorMachine(initialContext?: GraphEditorContext) {
  const services = useServices();
  const machine = React.useMemo(() => makeGraphEditorMachine(services.documents, initialContext), []);
  return useMachine(machine);
}