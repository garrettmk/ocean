import { DocumentEditorContext, DocumentEditorContextValue } from '@/react-web/contexts';
import React from 'react';


export function DocumentEditorProvider({
  editor,
  children
}: React.PropsWithChildren<{
  editor: DocumentEditorContextValue | undefined
}>) {

  return (
    <DocumentEditorContext.Provider value={editor}>
      {children}
    </DocumentEditorContext.Provider>
  );
}