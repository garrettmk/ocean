import React from 'react';
import { useGraphEditorMachine } from '../hooks';


export type GraphEditorContextValue = ReturnType<typeof useGraphEditorMachine>;


// @ts-ignore
export const DocumentGraphContext = React.createContext<GraphEditorContextValue>();