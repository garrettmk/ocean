import { useMachine } from "@xstate/react";
import { useServices } from "../services";
import React from 'react';
import { makeGraphEditorMachine } from "@/client/viewmodels";


export function useGraphEditorMachine() {
  const services = useServices();
  const machine = React.useMemo(() => makeGraphEditorMachine(services.documents), []);
  return useMachine(machine);
}