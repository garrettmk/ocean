import { NodeProps, Handle, Position } from 'react-flow-renderer';
import { Box, Text, Heading } from '@chakra-ui/react';


export function DocumentNode(props: NodeProps) {
  const { id, data: doc, type, selected, sourcePosition, targetPosition } = props;

  return (
    <Box
      bg='white'
      p='4'
      overflow='hidden'
      borderRadius='4'
    >
      <Handle
        type='target'
        position={Position.Top}
        id='top'
      />
      <Heading as='h6' size='md'>{doc?.title}</Heading>
      <Text color='gray.500'>{`${doc.contentType}`}</Text>
      <Handle
        type='source'
        position={Position.Bottom}
        id='bottom'
      />
    </Box>
  );
}