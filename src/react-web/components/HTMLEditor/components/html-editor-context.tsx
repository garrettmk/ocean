import React from 'react';
import {
  ContentEditableBehavior, DeleteElementBehavior, EmbeddedHTMLRef, ReplaceRootBehavior, SelectionBehavior
} from './html-editor-behaviors';


export type HTMLEditorContextValue = {
  embed: EmbeddedHTMLRef,
  selection: SelectionBehavior,
  replaceRoot: ReplaceRootBehavior,
  contentEditable: ContentEditableBehavior
  deleteElement: DeleteElementBehavior
};

// @ts-ignore
export const HTMLEditorContext = React.createContext<HTMLEditorContextValue>();

export function useHTMLEditor() : HTMLEditorContextValue {
  return React.useContext(HTMLEditorContext);
}

