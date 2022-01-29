import { makeBrowseDocumentsMachine } from "@/client/machines";
import { useServices } from "@/react-web/services";
import { Box, BoxProps, Heading, Link, Skeleton, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { useMeasure } from "react-use";
import { Link as RouterLink } from 'wouter';


export function DocumentList(props: BoxProps) {
  const services = useServices();
  const machine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  // @ts-ignore
  const [state, send] = useMachine(machine);
  const docs = state.context.documents ?? [];

  const selectedId = 'no';

  return (
    <Box {...props}>
      {state.matches('loading') && !docs.length ? (
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
          {docs.map(doc => (
            <RouterLink to={`/doc/${doc.id}`}>
              <Box 
                px='4'
                py='2'
                bgColor={doc.id === selectedId ? 'gray.300' : undefined}
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