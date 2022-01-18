import { Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { useNodeResizing } from '../hooks';


export function DocumentNode(props: NodeProps) {
  const { id, data: doc, type, selected, sourcePosition, targetPosition } = props;
  const [resizeHandleRef, resizeElementRef] = useNodeResizing();

  return (
    <Box
      ref={resizeElementRef}
      bg='white'
      p='4'
      overflow='hidden'
      borderRadius='4'
    >
      <Handle id='top' type='target' position={Position.Top} />
      <Handle id='bottom' type='source' position={Position.Bottom}/>
      
      <Heading id='draghandle' as='h6' size='md'>
        {doc?.title}
      </Heading>
      
      <Text color='gray.500'>
        {`${doc.contentType}`}
      </Text>

      <Box
        ref={resizeHandleRef}
        position='absolute'
        bottom='0'
        right='0'
        width='4'
        height='4'
        bg='gray.400'
      />
    </Box>
  );
}
