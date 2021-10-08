import { Box, BoxProps } from "@chakra-ui/layout";
import React from "react";


export type AppBarProps = BoxProps;


export const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
  return (
    <Box
      ref={ref}
      bg='white'
      p='4'
      boxSizing='border-box'
      position='sticky'
      top='0px'
      {...props}
    />
  );
});