import { Portal, Box, BoxProps } from '@chakra-ui/react';


export type HaloProps = Omit<BoxProps, 'position' | 'top' | 'left' | 'bottom' | 'right' | 'width' | 'height' | 'pointerEvents'> & {
  element?: HTMLElement | null,
}


export function Halo({
  element,
  ...boxProps
}: HaloProps) {
  if (!element)
    return null;
  
  const rect = element.getBoundingClientRect();

  return (
    <Portal>
      <Box
        position='absolute'
        top={rect.top + window.scrollY + 'px'}
        left={rect.left + window.scrollX + 'px'}
        width={rect.width + 'px'}
        height={rect.height + 'px'}
        pointerEvents='none'
        borderWidth='1px'
        borderRadius='md'
        borderStyle='dotted'
        {...boxProps}
      ></Box>
    </Portal>
  );
}