import { useDocumentEditor } from '@/react-web/hooks';
import { Input, InputProps } from '@chakra-ui/input';
import React from 'react';


export type DocumentTitleInputProps = InputProps & {  };

export function DocumentTitleInput(props: DocumentTitleInputProps) : JSX.Element {
  const editor = useDocumentEditor();

  return (
    <Input
      value={editor.document?.title ?? ''}
      onChange={e => editor.setTitle(e.target.value)}
      {...props}
    />
  );
}