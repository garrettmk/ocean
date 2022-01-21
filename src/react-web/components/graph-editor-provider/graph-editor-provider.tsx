import { DocumentGraphContext, GraphEditorContextValue } from '@/react-web/contexts';
import React from 'react';


export function GraphEditorProvider({
  editor,
  children
}: React.PropsWithChildren<{
  editor: GraphEditorContextValue
}>) : JSX.Element {
  return (
    <DocumentGraphContext.Provider value={editor}>
      {children}
    </DocumentGraphContext.Provider>
  );
}