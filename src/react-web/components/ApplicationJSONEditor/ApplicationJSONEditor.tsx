import { Box } from '@chakra-ui/react';


export function ApplicationJSONEditor({
  content,
  onChange
}: {
  content: any,
  onChange: any
}) : JSX.Element {
  return (
    <Box
      gridArea='content'
    >
      <pre>
        {JSON.stringify(content, null, '  ')}
      </pre>
    </Box>
  );
}


