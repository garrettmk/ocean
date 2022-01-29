import { GraphNode } from '@/content';
import React from 'react';


export type GraphContentEditorContextValue = {
  updateNode(node: GraphNode): void
}

export const GraphContentEditorContext = React.createContext<GraphContentEditorContextValue | undefined>(undefined);


