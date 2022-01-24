import React from 'react';
import { DocumentEditorMachineDispatch, DocumentEditorMachineState } from '../document-editor';


export type DocumentEditorContextValue = {
  state: DocumentEditorMachineState,
  send: DocumentEditorMachineDispatch
}

export const DocumentEditorContext = React.createContext<DocumentEditorContextValue | undefined>(undefined);