import React from 'react';
import { Halo } from './halo';
import { useHTMLEditor } from './html-editor-context';


export function SelectionHalos() {
  const editor = useHTMLEditor();
  const { hoveredElement, selectedElement } = editor.selection;

  return (
    <>
      <Halo
        element={hoveredElement}
        borderWidth='2px'
        borderStyle='solid'
        borderColor='gray.300'
      />
      <Halo
        element={selectedElement}
        borderWidth='2px'
        borderStyle='solid'
        borderColor='blue.300'
      />
    </>
  )
}