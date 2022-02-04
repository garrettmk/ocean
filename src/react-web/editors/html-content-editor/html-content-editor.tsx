import { HTMLContent } from '@/content';
import { useDocumentEditor } from '@/react-web/editors/document-editor';
import { Portal } from '@chakra-ui/react';
import React from 'react';
import { ContentEditorProps } from '../content-editor/content-editor';
import { EmbeddedHTML, HTMLEditorProvider, HTMLEditorToolbar, SelectionHalos } from './components';


export const HTMLEditor = React.forwardRef<HTMLDivElement, ContentEditorProps>(function HTMLEditor(props, ref) {
  const {
    toolbarRef,
    toolbarSize,
    ...boxProps
  } = props;

  const editor = useDocumentEditor();
  const combinedRef = React.useMemo(() => ref 
    ? ref as React.RefObject<HTMLDivElement> 
    : React.createRef<HTMLDivElement>()
  , [ref]);

  return (
    <HTMLEditorProvider embed={combinedRef}>
      {toolbarRef && (
        <Portal containerRef={toolbarRef}>
          <HTMLEditorToolbar size={toolbarSize}/>
        </Portal>
      )}
        <SelectionHalos />

        <EmbeddedHTML
          ref={combinedRef}
          html={editor?.state?.context.document?.content as HTMLContent}
          onChange={(value: any) => editor?.send({ type: 'editDocument', payload: { content: value, contentType: 'text/html' }})}
          {...boxProps}
        />
    </HTMLEditorProvider>
  );
});