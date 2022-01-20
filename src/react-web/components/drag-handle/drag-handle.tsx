import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export type DragHandleProps = BoxProps;

export const DragHandle = React.forwardRef<HTMLDivElement, BoxProps>(function DrageHandle(props, ref) {
  return (
    <Box
        ref={ref}
        width='16px'
        height='16px'
        overflow='hidden'
        borderBottomRightRadius='3px'
        {...props}
      >
        <Box
          borderStyle='solid'
          borderWidth='8px'
          borderColor='transparent'
          borderBottomColor='gray.600'
          borderRightColor='gray.600'
        />
      </Box>
    );
}) 