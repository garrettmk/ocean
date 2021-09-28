import { GridItem } from '@chakra-ui/layout';
import React from 'react';


export type AppSidebarProps = React.PropsWithChildren<{}>;

export function AppSidebar({
  children
}: AppSidebarProps) {
  return (
    <GridItem
      alignSelf='start'
      position='sticky'
      top='0'
    >
      {children}
    </GridItem>
  );
}