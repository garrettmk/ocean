import { Grid, GridItem, GridProps } from "@chakra-ui/layout";
import React from "react";


export type AppBarProps = Omit<GridProps, 'bg' | 'p'> & {
  primary?: React.RefObject<HTMLDivElement>,
  secondary?: React.RefObject<HTMLDivElement>,
  tertiary?: React.RefObject<HTMLDivElement>,
};


export const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
  const { primary, secondary, tertiary, ...gridProps } = props;

  return (
    <Grid
      ref={ref}
      bg='white'
      p='4'
      templateColumns='1fr 1fr 1fr'
      templateRows='1fr'
      columnGap='4'
      alignItems='center'
      boxSizing='border-box'
      position='sticky'
      top='0px'
      {...gridProps}
    >
      <GridItem
        ref={primary}
        display='flex'
        justifyContent='flex-start'
        alignItems='center'
      />

      <GridItem
        ref={secondary}
        display='flex'
        justifyContent='center'
        alignItems='center'
      />

      <GridItem
        ref={tertiary}
        display='flex'
        justifyContent='flex-end'
        alignItems='center'
      />
    </Grid>
  );
});