import { ID, UpdateDocumentInput } from "@/domain";
import { useMachine } from "@xstate/react";
import React from "react";
import { DocumentEditorEvent, makeDocumentEditorMachine } from "@/react-web/document-editor";
import { useServices } from "@/react-web/services";
import { bindEventCreators } from "@/react-web/utils";
import { useStateTransition, useGraphEditor } from "@/react-web/hooks";


export function useDocumentEditorMachine() {
  const graphEditor = useGraphEditor();
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

  // If we are inside a graph editor, update the graph when the document is saved  
  if (graphEditor) {
    useStateTransition(state, 'savingDocument.saving', {
      out: (current, previous) => {
        console.log('saving out');
        if (!current.context.error)
          graphEditor.send({ type: 'updateDocument', payload: { ...current.context.document! } });
      }
    });

    // ...or deleted
    useStateTransition(state, 'deletingDocument.deleting', {
      out: (current, previous) => {
        console.log('deleting out');
        if (!current.context.error)
          graphEditor.send({ type: 'removeDocument', payload: previous!.context.document!.id });
      }
    });
  }

  return {
    state,
    send,
    document: state.context.document,
    error: state.context.error,
    ...uiEventCreators,
  };
}
