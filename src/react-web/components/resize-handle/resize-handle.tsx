import React from 'react';
import { Box, BoxProps, Icon, IconProps } from '@chakra-ui/react';
import { MdKeyboardArrowRight } from 'react-icons/md';

export type ResizeHandleProps = BoxProps;

export const ResizeHandle = React.forwardRef<HTMLDivElement, BoxProps>(function ResizeHandle(props, ref) {
  return (
    <Box ref={ref} cursor='nwse-resize' {...props}>
      <Icon
        as={MdKeyboardArrowRight}
        boxSize={8}
        transform={'rotate(45deg)'}
      />
    </Box>
  );
});