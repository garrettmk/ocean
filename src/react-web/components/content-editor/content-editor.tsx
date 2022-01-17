import { useDocumentEditor } from '@/react-web/hooks';
import { BoxProps } from '@chakra-ui/layout';
import { ButtonGroupProps } from '@chakra-ui/react';
import React from 'react';
import {
  TextEditor,
  JSONEditor,
  HTMLEditor,
  SlateEditor
} from './components';


export type ContentEditorProps = BoxProps & {
  toolbarRef?: React.RefObject<HTMLDivElement>,
  toolbarSize?: ButtonGroupProps['size'],
  readonly?: boolean,
};


export function ContentEditor(props: ContentEditorProps): JSX.Element {
  const editor = useDocumentEditor();
  const contentType = editor.document?.contentType ?? '';

  const ContentEditorComponent = React.useMemo(() => ({
    'text/plain': TextEditor,
    'application/json': JSONEditor,
    'application/json;format=slate': SlateEditor,
    'text/html': HTMLEditor,
  }[contentType] ?? JSONEditor), [contentType]);

  return (
    <ContentEditorComponent {...props}/>
  );
}