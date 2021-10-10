import { makeGraphEditorMachine, makeDocumentEditorMachine } from '@/client/viewmodels';
import { ID } from '@/domain';
import { useMachine } from '@xstate/react';
import React from 'react';
import { useServices } from '../services';


export function useGraphEditorMachine() {
  const services = useServices();
  const machine = React.useMemo(() => makeGraphEditorMachine(services.documents), []);
  return useMachine(machine);
}


export type DocumentEditor = ReturnType<typeof useDocumentEditorMachine>;

export function useDocumentEditorMachine() {
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentEditorMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const document = state.context.document;

  // Load the document when the component mounts
  const open = React.useCallback((id: ID) => {
    send({ type: 'open', payload: id });
  }, []);


  // Change the title
  const setTitle = React.useCallback((title: string) => {
    send({ type: 'edit', payload: {
      title
    }});
  }, [send]);


  // Change the content
  const setContent = React.useCallback(newContent => {
    // if (document?.contentType && newContent) {
    //   const analysis = services.analysis.analyze(document.contentType, newContent);
    // }

    send({
      type: 'edit', payload: {
        contentType: document!.contentType,
        content: newContent
      }
    });
  }, [send, document?.contentType]);


  // Save the document
  const save = React.useCallback(() => {
    send({ type: 'save' });
  }, [send]);


  return {
    state,
    document,
    send,
    open,
    setTitle,
    setContent,
    save
  };
}