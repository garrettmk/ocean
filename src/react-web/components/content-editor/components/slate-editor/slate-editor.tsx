import { SlateContent } from '@/content';
import { useDocumentEditor } from '@/react-web/hooks';
import { Grid, Portal } from '@chakra-ui/react';
import React from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { ContentEditorProps } from '../../content-editor';
import { EditorToolbar, Element, FloatingElementEditor, Leaf, LinkElementEditor } from './components';
import { withCustom } from './withCustom';


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
          <EditorToolbar size={toolbarSize}/>
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
          renderElement={Element}
          renderLeaf={Leaf}
          placeholder='Start typing...'
        />
      </Grid>
    </Slate>
  );
}