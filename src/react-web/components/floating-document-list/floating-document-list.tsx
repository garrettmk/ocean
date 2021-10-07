import { useGraphEditor } from '@/react-web/hooks';
import React from 'react';
import { FloatingWindow, FloatingWindowProps } from '../floating-window';
import { Flex, VStack, StackDivider } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';
import { Link as RouterLink } from 'wouter';
import { Box } from '@chakra-ui/layout';
import { Heading } from '@chakra-ui/layout';
import { IconButton } from '@chakra-ui/button';
import { CloseIcon } from '@chakra-ui/icons';
import { Link, Text } from '@chakra-ui/layout';
import { FloatingWindowHeader } from '@/react-web/components/floating-window-header';
import { DocumentHeader } from '@/domain';
import { FloatingWindowCloseButton } from '@/react-web/components/floating-window-close-button';


export type FloatingDocumentListProps = Omit<FloatingWindowProps, 'onSelect'> & {
  isOpen: boolean,
  onClose?: () => void,
  onSelect?: (document: DocumentHeader) => void
};


export function FloatingDocumentList({
  isOpen,
  onClose,
  onSelect,
  ...windowProps
}: FloatingDocumentListProps): JSX.Element {
  const { state, send } = useGraphEditor();
  const docs = state.context.graph?.documents ?? [];

  return (
    <FloatingWindow maxW='100%' display={isOpen ? undefined : 'none'} {...windowProps}>
      <FloatingWindowHeader title='Search Results'>
        <FloatingWindowCloseButton onClick={onClose}/>
      </FloatingWindowHeader>

      {state.matches('loading') && !docs.length ? (
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
          divider={<StackDivider borderColor="gray.300"/>}
          align='stretch'
          spacing='4'
        >
          {docs.map(doc => (
            <Box 
              key={doc.id}
              px='4'
              py='2'
              cursor='pointer'
            >
              <Link onClick={() => onSelect?.(doc)}>
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