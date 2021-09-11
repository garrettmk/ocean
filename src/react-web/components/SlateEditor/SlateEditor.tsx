import { Grid } from '@chakra-ui/react';
import React from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { EditorToolbar, Element, Leaf } from './components';
import { withCustom } from './withCustom';


const DEFAULT_SLATE_CONTENT = [
  {
    type: 'paragraph',
    children: [
      { text: '' }
    ]
  }
];


export function SlateEditor({
  content = DEFAULT_SLATE_CONTENT,
  onChange
}: {
  content: any,
  onChange: (newContent: any) => void
}) : JSX.Element {
  const editor = React.useMemo(() => withCustom(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={content}
      onChange={onChange}
    >
      <Grid
        gridArea='content'
        templateRows='auto 1fr'
        templateColumns='1fr'
        gap={4}
      >
        <EditorToolbar/>
        <Editable
          renderElement={Element}
          renderLeaf={Leaf}
          placeholder='Start typing...'
        />
      </Grid>
    </Slate>
  );
}







