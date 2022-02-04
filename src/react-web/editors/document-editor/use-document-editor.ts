import React from 'react';
import { DocumentEditorContext } from './document-editor-context';


export function useDocumentEditor() {
  return React.useContext(DocumentEditorContext);
}