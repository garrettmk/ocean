import { ID } from "@/domain";
import { makeDocumentEditorMachine, DocumentEditorService } from "@/client/machines";
import { useServices } from "@/react-web/services";
import React from "react";
import { useUpdate } from "react-use";
import { interpret } from "xstate";


export type UseDocumentEditorMachineOptions = {
  documentId?: ID,
  start?: boolean
}

export function useDocumentEditorMachine(options?: UseDocumentEditorMachineOptions) {
  const services = useServices();
  const update = useUpdate();
  const documentEditor = React.useRef<DocumentEditorService>();
  
  // Create a "start" callback
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

  // Maybe just start it
  React.useEffect(() => {
    if (options?.start)
      startDocumentEditor();
  }, []);

  return {
    documentEditor: documentEditor.current,
    startDocumentEditor
  };
}