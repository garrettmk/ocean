import { Box, Textarea } from '@chakra-ui/react';
import React from 'react';
import type { ContentEditorProps } from '../content-editor';
import { useMachine } from '@/react-web/hooks';
import { makeTextContentEditorMachine } from '@/client/machines';


export const TextContentEditor = React.forwardRef<HTMLDivElement, ContentEditorProps>(function TextContentEditor({
  content = '',
  contentType = 'text/plain',
  onChangeContent,
  readonly,
  children,
  ...boxProps
}: ContentEditorProps, ref) {
  // Start an editor machine
  const editor = useMachine(makeTextContentEditorMachine, {
    content,
    contentType
  });

  // Update our parent component whenever the content changes
  React.useEffect(() => {
    onChangeContent?.(editor.state.context.content);
  }, [editor.state.context.content]);

  // Forward change events to the machine
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    editor.send({
      type: 'setContent',
      payload: event.target.value
    })
  }, [editor]);

  return (
    <Box
      ref={ref} 
      {...boxProps
    }>
      <Textarea
        value={content ?? ''}
        onChange={handleChange}
        readOnly={readonly}
        placeholder='Document is empty'
        border='none'
        focusBorderColor='none'
        width='100%'
        height='100%'
        p='0'
        resize='none'
      />
    </Box>
  );
});