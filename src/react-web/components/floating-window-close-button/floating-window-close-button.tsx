import { IconButton, IconButtonProps } from '@chakra-ui/button';
import { CloseIcon } from '@chakra-ui/icons';
import React from 'react';


export type FloatingWindowCloseButtonProps = Omit<IconButtonProps, 'aria-label'>;


export function FloatingWindowCloseButton({
  ...buttonProps
}: FloatingWindowCloseButtonProps) : JSX.Element {
  return <IconButton aria-label='Close' icon={<CloseIcon color='gray.500'/>} size='sm' {...buttonProps}/>;
}