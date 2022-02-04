import { DocumentHeader, ID } from '@/domain';
import { Box, BoxProps, Heading, Link, Skeleton, StackDivider, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink } from 'wouter';


export type DocumentListProps = BoxProps & {
  documents?: DocumentHeader[],
  selected?: ID[],
  isLoading?: boolean,
}

export function DocumentList({
  documents = [],
  selected = [],
  isLoading,
  ...boxProps
}: DocumentListProps) {
  const isSelected = (id: ID) => selected?.includes(id);

  return (
    <Box {...boxProps}>
      {isLoading ? (
        <VStack
          divider={<StackDivider borderColor='gray.300' mx='-4'/>}
          align='stretch'
        >
          <Skeleton height='75px' px='4' py='2'/>
          <Skeleton height='75px' px='4' py='2'/>
          <Skeleton height='75px' px='4' py='2'/>
          <Skeleton height='75px' px='4' py='2'/>
          <Skeleton height='75px' px='4' py='2'/>
        </VStack>
      ) : (
        <VStack
          divider={<StackDivider borderColor="gray.300" mx='-4'/>}
          align='stretch'
        >
          {documents.map(doc => (
            <RouterLink to={`/doc/${doc.id}`}>
              <Box 
                px='4'
                py='2'
                bgColor={isSelected(doc.id) ? 'gray.300' : undefined}
                cursor='pointer'
              >
                <Link>
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
            </RouterLink>
          ))}
        </VStack>
      )}

    </Box>
  );
}