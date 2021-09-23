import { Grid } from '@chakra-ui/react';
import React from 'react';
import { EmbeddedHTML, HTMLEditorProvider, HTMLEditorToolbar, SelectionHalos } from './components';


export function HTMLEditor({
  content,
  onChange
}: {
  content: string,
  onChange: any
}): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <HTMLEditorProvider embed={ref}>
      <Grid
        gridArea='content'
        templateRows='auto 1fr'
        templateColumns='1fr'
        gap={4}
      >
        <HTMLEditorToolbar
          position='sticky'
          top='0'
          bg='white'
          zIndex={100}
        />
        <SelectionHalos />

        <EmbeddedHTML
          ref={ref}
          html={content}
          onChange={onChange}
        />
      </Grid>
    </HTMLEditorProvider>
  );
}