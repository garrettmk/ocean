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


export type ContentEditorProps = Omit<BoxProps, 'onChange'> & {
  toolbarRef?: React.RefObject<HTMLDivElement>,
  toolbarSize?: ButtonGroupProps['size'],
  readonly?: boolean,
};


export const ContentEditor = React.forwardRef<HTMLDivElement, ContentEditorProps>(function ContentEditor(props, ref): JSX.Element {
  const editor = useDocumentEditor();
  const contentType = editor?.state?.context.document?.contentType ?? '';

  const ContentEditorComponent = React.useMemo(() => ({
    'text/plain': TextEditor,
    // 'application/json': JSONEditor,
    // 'application/json;format=slate': SlateEditor,
    'text/html': HTMLEditor,
  }[contentType] ?? JSONEditor), [contentType]);

  return <ContentEditorComponent ref={ref} {...props}/>;
});