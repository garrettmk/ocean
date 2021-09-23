import React from 'react';
import { HTMLEditorContext } from "./html-editor-context";
import { EmbeddedHTMLRef, useSelectionBehavior, useReplaceRootBehavior, useContentEditableBehavior } from "./html-editor-behaviors";


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

  const value = React.useMemo(() => ({
    embed,
    selection,
    replaceRoot,
    contentEditable
  }), [embed, selection, replaceRoot, contentEditable]);

  return (
    <HTMLEditorContext.Provider value={value}>
      {children}
    </HTMLEditorContext.Provider>
  );
}

