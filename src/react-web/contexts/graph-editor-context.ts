import React from 'react';
import { useGraphEditorMachine } from '../hooks';


export type GraphEditorContextValue = ReturnType<typeof useGraphEditorMachine>;

export const DocumentGraphContext = React.createContext<GraphEditorContextValue | undefined>(undefined);