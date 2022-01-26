import React from 'react';
import { useDocumentEditorMachine } from '@/react-web/hooks';


export type DocumentEditorContextValue = ReturnType<typeof useDocumentEditorMachine>;

export const DocumentEditorContext = React.createContext<DocumentEditorContextValue | undefined>(undefined);