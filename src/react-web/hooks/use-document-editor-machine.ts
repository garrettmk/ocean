import { ID, UpdateDocumentInput } from "@/domain";
import { useMachine } from "@xstate/react";
import React from "react";
import { DocumentEditorEvent, makeDocumentEditorMachine } from "../machines";
import { useServices } from "../services";
import { bindEventCreators } from "../utils";


export function useDocumentEditorMachine() {
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentEditorMachine(services.documents, services.migrations), []);
  const [state, send] = useMachine(machine);

  const document = state.context.document;
  const uiEventCreators = React.useMemo(() => bindEventCreators((event: DocumentEditorEvent) => send(event), {
    openDocument: (id: ID) => ({ type: 'openDocument', payload: id }),
    editDocument: (payload: UpdateDocumentInput) => ({ type: 'editDocument', payload }),
    convertDocument: () => ({ type: 'convertDocument' }),
    confirmConvertDocument: (contentType: string) => ({ type: 'confirmConvertDocument', payload: contentType }),
    saveDocument: () => ({ type: 'saveDocument' }),
    deleteDocument: () => ({ type: 'deleteDocument' }),
    confirmDeleteDocument: () => ({ type: 'confirmDeleteDocument' }),
    cloneDocument: () => ({ type: 'cloneDocument' }),
    cancel: () => ({ type: 'cancel' }),
    setTitle: (title: string) => ({ type: 'editDocument', payload: { title } }),
    setContent: (content: any) => ({ type: 'editDocument', payload: { content, contentType: document!.contentType }}),
  }), [send, document]);

  return {
    state,
    send,
    document: state.context.document,
    ...uiEventCreators,
  };
}
