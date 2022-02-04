import { Document, DocumentHeader } from '@/domain';
import { FloatingWindowCloseButton } from '@/react-web/components/floating-window-close-button';
import { FloatingWindowHeader } from '@/react-web/components/floating-window-header';
import { Box, Heading, Link, StackDivider, Text, VStack } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';
import React from 'react';
import { FloatingWindow, FloatingWindowProps } from '../floating-window';


export type FloatingDocumentListProps = Omit<FloatingWindowProps, 'onSelect'> & {
  isOpen: boolean,
  onClose?: () => void,
};


export function FloatingDocumentList({
  isOpen,
  onClose,
  ...windowProps
}: FloatingDocumentListProps): JSX.Element {

  return (
    <FloatingWindow maxW='100%' display={isOpen ? undefined : 'none'} {...windowProps}>
      <FloatingWindowHeader title='Search Results'>
        <FloatingWindowCloseButton onClick={onClose}/>
      </FloatingWindowHeader>

      {false ? (
        <VStack
          divider={<StackDivider borderColor='gray.300'/>}
          align='stretch'
          spacing='4'
        >
          <Skeleton height='75px'/>
          <Skeleton height='75px'/>
          <Skeleton height='75px'/>
          <Skeleton height='75px'/>
          <Skeleton height='75px'/>
        </VStack>
      ) : (
        <VStack
          divider={<StackDivider borderColor="gray.300" m='0px !important'/>}
          align='stretch'
        >
          {[].map((doc: Document) => (
            <Box 
              key={doc.id}
              px='4'
              py='6'
              cursor='pointer'
              // bg={isSelected(doc) ? 'blue.100' : undefined}
            >
              <Link onClick={() => {}}>
                <Heading 
                  fontSize='md'
                  whiteSpace='nowrap'
                  textOverflow='ellipsis'
                  overflow='hidden'
                >
                  {doc.title}
                </Heading>
              </Link>
              <Text
                size='xs'
                color='GrayText'
              >
                {doc.contentType}
              </Text>
            </Box>
          ))}
        </VStack>
      )}

    </FloatingWindow>
  )
}