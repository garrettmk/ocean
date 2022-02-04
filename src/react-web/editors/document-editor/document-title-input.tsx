import { useDocumentEditor } from './use-document-editor';
import { Input, InputProps } from '@chakra-ui/input';
import React from 'react';


export type DocumentTitleInputProps = Omit<InputProps, 'value' | 'onChange'>;

export function DocumentTitleInput(props: DocumentTitleInputProps) : JSX.Element {
  const editor = useDocumentEditor();
  const setTitle = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    editor?.send({ type: 'editDocument', payload: {
      contentType: editor!.state.context.document!.contentType,
      content: event.target.value,
    }})
  }, [editor]);

  return (
    <Input
      value={editor?.state.context.document?.title ?? ''}
      onChange={setTitle}
      {...props}
    />
  );
}