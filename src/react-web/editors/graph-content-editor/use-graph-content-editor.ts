import React from 'react';
import { GraphContentEditorContext } from './graph-content-editor-context';


export function useGraphContentEditor() {
  const contextValue = React.useContext(GraphContentEditorContext);
  if (!contextValue)
    throw new Error('useGraphContentEditor() must be used within a GraphContentEditorContext');

  return contextValue;
}

