import React from 'react';
import { useDocumentEditorMachine } from '../hooks';


export type DocumentEditorContextValue = ReturnType<typeof useDocumentEditorMachine>


 // @ts-ignore
 export const DocumentEditorContext = React.createContext<DocumentEditorContextValue>();