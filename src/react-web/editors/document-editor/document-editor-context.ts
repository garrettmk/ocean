import React from 'react';
import { useDocumentEditorMachine } from './use-document-editor-machine';


export type DocumentEditorContextValue = ReturnType<typeof useDocumentEditorMachine>['documentEditor'];

export const DocumentEditorContext = React.createContext<DocumentEditorContextValue | undefined>(undefined);