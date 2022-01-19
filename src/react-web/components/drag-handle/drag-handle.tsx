import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';


export const DragHandle = React.forwardRef<HTMLDivElement, BoxProps>(function DrageHandle(props, ref) {
  return (
    <Box
        ref={ref}
        width='8px'
        height='8px'
        overflow='hidden'
        borderBottomRightRadius='3px'
        {...props}
      >
        <Box
          borderStyle='solid'
          borderWidth='4px'
          borderColor='transparent'
          borderBottomColor='gray.600'
          borderRightColor='gray.600'
        />
      </Box>
    );
}) 