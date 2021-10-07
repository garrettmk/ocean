import { Grid, GridProps } from '@chakra-ui/layout';
import { Portal } from '@chakra-ui/portal';
import React from 'react';

export type FloatingWindowLayoutProps = GridProps;


export function FloatingWindowLayout({
  children,
  ...gridProps
}: FloatingWindowLayoutProps) : JSX.Element {
  return (
    <Portal>
      <Grid
        position='absolute'
        top="0px"
        left="0px"
        bottom="0px"
        right="0px"
        templateColumns="repeat(12, 1fr)"
        templateRows="1fr"
        pointerEvents='none'
        gap='4'
        m='4'
        {...gridProps}
      >
        {children}
      </Grid>
    </Portal>
  );
}