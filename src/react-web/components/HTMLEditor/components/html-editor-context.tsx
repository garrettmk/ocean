import React from 'react';
import {
  ContentEditableBehavior, EmbeddedHTMLRef, ReplaceRootBehavior, SelectionBehavior
} from './html-editor-behaviors';


export type HTMLEditorContextValue = {
  embed: EmbeddedHTMLRef,
  selection: SelectionBehavior,
  replaceRoot: ReplaceRootBehavior,
  contentEditable: ContentEditableBehavior
};

// @ts-ignore
export const HTMLEditorContext = React.createContext<HTMLEditorContextValue>();

export function useHTMLEditor() : HTMLEditorContextValue {
  return React.useContext(HTMLEditorContext);
}

