import { Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { useNodeResizing } from '../hooks';
import { ScaledDragHandle } from './scaled-drag-handle';
import { useGraphEditor } from '@/react-web/hooks';


export function DocumentNode(props: NodeProps) {
  const { id, data: doc, type, selected, sourcePosition, targetPosition } = props;
  const { state, send } = useGraphEditor();
  const [resizeHandleRef, resizeElementRef] = useNodeResizing({
    stop: ({ x, y, width, height }) => send({ type: 'updateDocument', payload: {id, meta: {
      x, y, width, height
    } }})
  });

  const width = doc.meta.layout?.width ? `${doc.meta.layout.width}px` : undefined;
  const height = doc.meta.layout?.height ? `${doc.meta.layout.height}px` : undefined;

  return (
    <Box
      ref={resizeElementRef}
      bg='white'
      p='4'
      overflow='hidden'
      borderRadius='4'
      borderWidth='2px'
      borderColor={selected ? 'blue.500' : 'transparent'}
      width={width}
      height={height}
    >
      <Handle id='top' type='target' position={Position.Top} />
      <Handle id='bottom' type='source' position={Position.Bottom}/>
      
      <Heading id='draghandle' as='h6' size='md'>
        {doc?.title}
      </Heading>
      
      <Text color='gray.500'>
        {`${doc.contentType}`}
      </Text>

      <ScaledDragHandle
        ref={resizeHandleRef}
        position='absolute'
        bottom='0'
        right='0'
      />
    </Box>
  );
}
