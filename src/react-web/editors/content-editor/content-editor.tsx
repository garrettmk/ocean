import { useDocumentEditor } from '@/react-web/editors/document-editor';
import { BoxProps } from '@chakra-ui/layout';
import { ButtonGroupProps } from '@chakra-ui/react';
import { TextContentEditor } from '../text-content-editor';
import React from 'react';


export type ContentEditorProps = Omit<BoxProps, 'onChange'> & {
  toolbarRef?: React.RefObject<HTMLDivElement>,
  toolbarSize?: ButtonGroupProps['size'],
  readonly?: boolean,
  contentType?: string,
  content?: any,
  onChangeContent?: (newContent: any) => void;
};


export const ContentEditor = React.forwardRef<HTMLDivElement, ContentEditorProps>(function ContentEditor(props, ref): JSX.Element {
  const documentEditor = useDocumentEditor();
  const defaultOnChangeContent = React.useCallback((content: any) => {
    const contentType = documentEditor?.state.context.document?.contentType!;
    documentEditor?.send({ type: 'editDocument', payload: {
      contentType,
      content
    }});
  }, [documentEditor]);

  const {
    contentType = documentEditor?.state.context.document?.contentType ?? '',
    content = documentEditor?.state.context.document?.content,
    onChangeContent = defaultOnChangeContent,
    ...remainingProps
  } = props;

  const ContentEditorComponent = React.useMemo(() => ({
    'text/plain': TextContentEditor
  }[contentType] ?? TextContentEditor), [contentType]);

  return (
    <ContentEditorComponent {...{
      ref,
      contentType,
      content,
      onChangeContent,
      ...remainingProps
    }}/>
  );
});