import { HTMLContent } from '@/content';
import { useDocumentEditor } from '@/react-web/hooks';
import { Grid, Portal } from '@chakra-ui/react';
import React from 'react';
import { ContentEditorProps } from '../../content-editor';
import { EmbeddedHTML, HTMLEditorProvider, HTMLEditorToolbar, SelectionHalos } from './components';


export function HTMLEditor({
  toolbarRef,
  ...boxProps
}: ContentEditorProps): JSX.Element {
  const editor = useDocumentEditor();
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <HTMLEditorProvider embed={ref}>
      {toolbarRef && (
        <Portal containerRef={toolbarRef}>
          <HTMLEditorToolbar/>
        </Portal>
      )}
      
      <Grid
        templateRows='auto 1fr'
        templateColumns='1fr'
        gap={4}
        bg='white'
        {...boxProps}
      >
        <SelectionHalos />

        <EmbeddedHTML
          ref={ref}
          html={editor.document?.content as HTMLContent}
          onChange={editor.setContent}
          overflow='auto'
        />
      </Grid>
    </HTMLEditorProvider>
  );
}