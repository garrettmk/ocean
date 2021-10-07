import React from 'react';
import { DocumentEditorContext } from '../contexts';


export function useDocumentEditor() {
  return React.useContext(DocumentEditorContext);
}