import { DocumentEditorContext } from '@/react-web/contexts';
import { DocumentEditor } from '@/react-web/hooks';
import React from 'react';


export function DocumentEditorProvider({
  editor,
  children
}: React.PropsWithChildren<{
  editor: DocumentEditor
}>) {

  return (
    <DocumentEditorContext.Provider value={editor}>
      {children}
    </DocumentEditorContext.Provider>
  );
}