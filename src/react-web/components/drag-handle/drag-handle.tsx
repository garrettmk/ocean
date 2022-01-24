import { Box, Icon, IconProps, BoxProps } from '@chakra-ui/react';
import React from 'react';
import { MdDragHandle } from 'react-icons/md';
import { BsGrid3X2GapFill } from 'react-icons/bs';


export type DragHandleProps = BoxProps;

export const DragHandle = React.forwardRef<HTMLDivElement, DragHandleProps>(function DragHandle (props, ref) {
  return (
    <Box ref={ref} {...props}>
      <Icon
        as={BsGrid3X2GapFill}
        boxSize={6}
      />
    </Box>
  );
});