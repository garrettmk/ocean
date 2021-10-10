import { DocumentEditorMachineContext, DocumentEditorEvent, DocumentEditorTypeState } from '@/client/viewmodels';
import { Document, ID } from '@/domain';
import React from 'react';
import { Interpreter, State } from 'xstate';


export type DocumentEditorContextValue = { 
  state: State<DocumentEditorMachineContext, DocumentEditorEvent, any, DocumentEditorTypeState>,
  send: Interpreter<DocumentEditorMachineContext, any, DocumentEditorEvent, DocumentEditorTypeState>['send'],
  document?: Document,
  open: (id: ID) => void,
  setTitle: (title: string) => void,
  setContent: (content: any) => void,
  save: () => void
 };


 // @ts-ignore
 export const DocumentEditorContext = React.createContext<DocumentEditorContextValue>();