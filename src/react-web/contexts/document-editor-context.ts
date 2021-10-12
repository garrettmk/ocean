import { Document, ID } from '@/domain';
import React from 'react';
import { DocumentEditorMachineDispatch, DocumentEditorMachineState } from '../machines';


export type DocumentEditorContextValue = { 
  state: DocumentEditorMachineState,
  send: DocumentEditorMachineDispatch,
  document?: Document,
  open: (id: ID) => void,
  setTitle: (title: string) => void,
  setContent: (content: any) => void,
  save: () => void
 };


 // @ts-ignore
 export const DocumentEditorContext = React.createContext<DocumentEditorContextValue>();