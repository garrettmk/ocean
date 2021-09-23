import React from 'react';
import { HTMLEditorContext } from "./html-editor-context";
import { EmbeddedHTMLRef, useSelectionBehavior, useReplaceRootBehavior, useContentEditableBehavior, useDeleteElementBehavior } from "./html-editor-behaviors";


export type HTMLEditorProviderProps = React.PropsWithChildren<{
  embed: EmbeddedHTMLRef
}>;


export function HTMLEditorProvider({
  embed,
  children
}: HTMLEditorProviderProps) {
  const selection = useSelectionBehavior(embed);
  const replaceRoot = useReplaceRootBehavior(embed, selection);
  const contentEditable = useContentEditableBehavior(embed);
  const deleteElement = useDeleteElementBehavior(embed, selection);

  const value = React.useMemo(() => ({
    embed,
    selection,
    replaceRoot,
    contentEditable,
    deleteElement
  }), [embed, selection, replaceRoot, contentEditable, deleteElement]);

  return (
    <HTMLEditorContext.Provider value={value}>
      {children}
    </HTMLEditorContext.Provider>
  );
}

