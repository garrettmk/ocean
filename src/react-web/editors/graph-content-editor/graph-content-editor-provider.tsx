import React from 'react';
import { GraphContentEditorContextValue, GraphContentEditorContext } from '@/react-web/editors';

export function GraphContentEditorProvider({
  updateNode,
  children
}: React.PropsWithChildren<GraphContentEditorContextValue>) {
  const value = React.useRef<GraphContentEditorContextValue>({
    updateNode
  });

  value.current.updateNode = updateNode;

  return <GraphContentEditorContext.Provider value={value.current} children={children}/>;
}