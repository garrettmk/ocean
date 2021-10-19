import { Flex, FlexProps, Heading } from '@chakra-ui/layout';
import React from 'react';


export type FloatingWindowHeaderProps = FlexProps & {
  title: string,
};


export function FloatingWindowHeader({
  title,
  children,
  ...flexProps
}: FloatingWindowHeaderProps): JSX.Element {
  return (
    <Flex
      p='4'
      alignItems='baseline'
      position='sticky'
      top='0px'
      zIndex='1000'
      bg='white'
      {...flexProps}
    >
      <Heading
        as='span'
        fontSize='smaller'
        textTransform='uppercase'
        color='gray.500'
        lineHeight='1'
        mr='auto'
      >
        {title}
      </Heading>
      {children}
    </Flex>
  );
}