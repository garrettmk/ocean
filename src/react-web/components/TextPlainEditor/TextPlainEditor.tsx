import React from 'react';
import { Textarea } from '@chakra-ui/react';


export function TextPlainEditor({
  content,
  onChange
}: {
  content?: string,
  onChange: (newContent: string) => void
}) : JSX.Element {
  return (
    <Textarea
      gridArea='content'
      h='100%'
      value={content ?? ''}
      onChange={event => onChange(event.target.value)}
    />
  );
}
