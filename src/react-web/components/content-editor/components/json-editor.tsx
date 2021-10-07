import { useDocumentEditor } from '@/react-web/hooks';
import { Box } from '@chakra-ui/react';
import { ContentEditorProps } from '../content-editor';


export function JSONEditor({
  toolbarRef,
  ...boxProps
}: ContentEditorProps) : JSX.Element {
  const editor = useDocumentEditor();
  const content = editor.document?.content;

  return (
    <Box {...boxProps}>
      <pre>
        {JSON.stringify(content, null, '  ')}
      </pre>
    </Box>
  );
}


