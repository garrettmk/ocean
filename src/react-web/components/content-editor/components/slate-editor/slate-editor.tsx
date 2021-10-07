import { SlateContent } from '@/content';
import { useDocumentEditor } from '@/react-web/hooks';
import { Grid } from '@chakra-ui/react';
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
  ...boxProps
}: ContentEditorProps) : JSX.Element {
  const editor = useDocumentEditor();
  const slateEditor = React.useMemo(() => withCustom(withReact(createEditor())), []);
  const elementEditors = React.useMemo(() => ({
    link: LinkElementEditor
  }), []);

  const handleSlateContentChange = (newContent: any) => editor.setContent(newContent);

  return (
    <Slate
      editor={slateEditor}
      value={(editor.document?.content as SlateContent) ?? DEFAULT_SLATE_CONTENT}
      onChange={handleSlateContentChange}
    >
      <Grid
        templateRows='auto 1fr'
        templateColumns='1fr'
        gap={4}
        {...boxProps}
      >
        <EditorToolbar/>
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