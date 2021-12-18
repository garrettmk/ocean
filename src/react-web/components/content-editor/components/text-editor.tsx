import React from 'react';
import { Textarea, Box } from '@chakra-ui/react';
import { ContentEditorProps } from '../content-editor';
import { useDocumentEditor } from '@/react-web/hooks';


export function TextEditor({
  toolbarRef,
  readonly,
  ...boxProps
}: ContentEditorProps) : JSX.Element {
  const editor = useDocumentEditor();
  const content = (editor.document?.content as string) ?? '';
  
  return (
    <Box 
      display='grid'
      {...boxProps}
    >
      <Textarea
        w='100%'
        h='100%'
        focusBorderColor='transparent'
        value={content}
        readOnly={readonly}
        onChange={event => editor.setContent(event.target.value)}
      />
    </Box>
  );
}
