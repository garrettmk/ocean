import React from 'react';
import { DocumentGraphContext, GraphEditorContextValue } from '../contexts';


export function useGraphEditor() : GraphEditorContextValue {
  return React.useContext(DocumentGraphContext);
}