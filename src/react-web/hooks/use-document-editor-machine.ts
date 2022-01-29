import { ID } from "@/domain";
import { makeDocumentEditorMachine, DocumentEditorService } from "@/react-web/document-editor";
import { useServices } from "@/react-web/services";
import { useMachine } from "@xstate/react";
import React from "react";
import { useUpdate } from "react-use";
import { interpret } from "xstate";


export function useDocumentEditorMachine(initialDocumentId?: ID) {
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentEditorMachine(services.documents, services.migrations, initialDocumentId), []);
  // @ts-ignore
  const [state, send] = useMachine(machine);

  return { state, send };
}


export type UseDocumentEditorOptions = {
  documentId?: ID
}

export function useDocumentEditorMachine2(options?: UseDocumentEditorOptions) {
  const services = useServices();
  const update = useUpdate();
  const documentEditor = React.useRef<DocumentEditorService>();
  
  const startDocumentEditor = React.useCallback(() => {
    if (documentEditor.current)
      return;

    const machine = makeDocumentEditorMachine(
      services.documents,
      services.migrations,
      options?.documentId
    );

    const service = interpret(machine);
    documentEditor.current = service;
    
    service.onTransition(update);
    service.start();
  }, [options?.documentId]);

  return {
    documentEditor: documentEditor.current,
    startDocumentEditor
  };
}