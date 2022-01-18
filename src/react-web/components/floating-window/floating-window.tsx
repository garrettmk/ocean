import { Box, BoxProps } from '@chakra-ui/layout';
import React from 'react';


export type FloatingWindowProps = BoxProps;


export function FloatingWindow({
  children,
  ...boxProps
}: FloatingWindowProps) {
  return (
    <Box
      bg='white'
      borderRadius='4'
      shadow='2xl'
      pointerEvents='all'
      overflow='auto'
      zIndex={100}
      {...boxProps}
    >
      {children}
    </Box>
  );
}