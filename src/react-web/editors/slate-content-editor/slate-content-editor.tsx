import { SlateContent } from '@/content';
import { useDocumentEditor } from '@/react-web/editors/document-editor';
import { Grid, Portal } from '@chakra-ui/react';
import React from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { ContentEditorProps } from '../content-editor/content-editor';
import { SlateEditorToolbar, SlateElement, FloatingElementEditor, SlateLeaf, LinkElementEditor } from './components';
import { withCustom } from './with-custom';


const DEFAULT_SLATE_CONTENT = [
  {
    type: 'paragraph',
    children: [
      { text: '' }
    ]
  }
];

const DEFAULT_ONCHANGE = (newContent: any) => {};


export function SlateEditor({
  toolbarRef,
  toolbarSize,
  ...boxProps
}: ContentEditorProps = {}) : JSX.Element {
  const editor = useDocumentEditor();
  const slateEditor = React.useMemo(() => withCustom(withReact(createEditor())), []);
  const elementEditors = React.useMemo(() => ({
    link: LinkElementEditor
  }), []);

  const handleSlateContentChange = (newContent: any) => editor?.send({ type: 'editDocument', payload: {
    content: newContent,
    contentType: editor?.state?.context.document?.contentType || 'application/json;format=slate'
  } });

  return (
    <Slate
      editor={slateEditor}
      value={(editor?.state?.context.document?.content as SlateContent) ?? DEFAULT_SLATE_CONTENT}
      onChange={handleSlateContentChange}
    >
      {toolbarRef && (
        <Portal containerRef={toolbarRef}>
          <SlateEditorToolbar size={toolbarSize}/>
        </Portal>
      )}

      <Grid
        templateRows='1fr'
        templateColumns='1fr'
        gap={4}
        {...boxProps}
      >
        <FloatingElementEditor {...{ elementEditors }}/>
        <Editable
          renderElement={SlateElement}
          renderLeaf={SlateLeaf}
          placeholder='Start typing...'
        />
      </Grid>
    </Slate>
  );
}