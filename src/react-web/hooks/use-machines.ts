import { makeGraphEditorMachine} from '@/client/viewmodels';
import { makeDocumentEditorMachine } from '../machines';
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
    send({ type: 'openDocument', payload: id });
  }, []);


  // Change the title
  const setTitle = React.useCallback((title: string) => {
    send({ type: 'editDocument', payload: {
      title
    }});
  }, [send]);


  // Change the content
  const setContent = React.useCallback(newContent => {
    // if (document?.contentType && newContent) {
    //   const analysis = services.analysis.analyze(document.contentType, newContent);
    // }

    send({
      type: 'editDocument', payload: {
        contentType: document!.contentType,
        content: newContent
      }
    });
  }, [send, document?.contentType]);


  // Save the document
  const save = React.useCallback(() => {
    send({ type: 'saveDocument' });
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