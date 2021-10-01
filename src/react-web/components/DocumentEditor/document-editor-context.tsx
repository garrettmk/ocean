import { ID } from '@/domain';
import React from 'react';


export type DocumentEditorContextValue = {
  id?: ID,
  view?: 'graph',
  toolbar?: JSX.Element,
}


export const DocumentEditorContext = React.createContext<DocumentEditorContextValue>({});


export function DocumentEditorProvider({
  children
}: React.PropsWithChildren<{}>) {
  return (
    <DocumentEditorContext.Provider value={{}}>
      {children}
    </DocumentEditorContext.Provider>
  );
}