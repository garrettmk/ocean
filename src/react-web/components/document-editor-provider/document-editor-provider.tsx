import { DocumentEditorContext, DocumentEditorContextValue } from '@/react-web/contexts';
import React from 'react';


export function DocumentEditorProvider({
  editor,
  children
}: React.PropsWithChildren<{
  editor: DocumentEditorContextValue
}>) {

  return (
    <DocumentEditorContext.Provider value={editor}>
      {children}
    </DocumentEditorContext.Provider>
  );
}