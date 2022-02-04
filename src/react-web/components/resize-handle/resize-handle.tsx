import React from 'react';
import { Box, BoxProps, Icon, IconProps } from '@chakra-ui/react';
import { MdKeyboardArrowRight } from 'react-icons/md';

export type ResizeHandleProps = BoxProps;

export const ResizeHandle = React.forwardRef<HTMLDivElement, BoxProps>(function ResizeHandle(props, ref) {
  const { color = 'inherit', ...boxProps } = props;
  return (
    <Box 
      ref={ref} 
      cursor='nwse-resize' 
      borderWidth='0.5rem'
      borderStyle='solid'
      borderRightColor={color}
      borderBottomColor={color}
      borderTopColor='transparent'
      borderLeftColor='transparent'
      borderBottomRightRadius='2'
      {...boxProps}
    />
  );
});