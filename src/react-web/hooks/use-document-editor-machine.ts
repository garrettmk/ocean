import { ID } from "@/domain";
import { makeDocumentEditorMachine } from "@/react-web/document-editor";
import { useServices } from "@/react-web/services";
import { useMachine } from "@xstate/react";
import React from "react";


export function useDocumentEditorMachine(initialDocumentId?: ID) {
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentEditorMachine(services.documents, services.migrations, initialDocumentId), []);
  const [state, send] = useMachine(machine);

  return { state, send };
}
