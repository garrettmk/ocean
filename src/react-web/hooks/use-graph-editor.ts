import React from 'react';
import { DocumentGraphContext } from '../contexts';


export function useGraphEditor() {
  return React.useContext(DocumentGraphContext);
}