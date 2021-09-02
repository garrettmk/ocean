import React from 'react';
import { useServices } from "@/react-web/services";
import { makeBrowseDocumentsMachine } from "@/client/viewmodels";
import { useMachine } from '@xstate/react';
import { Box, Button, Text, Link, VStack, StackDivider, Heading, Flex, ButtonGroup, IconButton, Skeleton, Spinner } from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useRoute } from 'wouter';
import { AddIcon } from '@chakra-ui/icons';


export function DocumentList() {
  const [location, setLocation] = useLocation();
  const services = useServices();
  const machine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const docs = state.context.documents ?? [];

  const createNewDocument = React.useCallback(async () => {
    const { id } = await services.documents.createDocument({});
    setLocation(`/doc/${id}`);
    send({ type: 'query' });
  }, []);

  const [match, params] = useRoute('/doc/:id');
  const selectedId = match && params && params.id;

  return (
    <Box
      minW='400px'
      p={8}
    >
      <Heading
        fontSize='xl'
        mb={8}
      >
        All Documents
      </Heading>
      
      <Flex
        alignItems='center'
        mb={4}
      >
        {state.matches('loading') ? (
          <Box flex='1 1 100%'>
            <Spinner size='sm' color='GrayText'/>
          </Box>
        ) : (
          <Text color='GrayText' flex='1 1 100%'>{docs.length} documents</Text>
        )}
        <ButtonGroup size='sm' colorScheme='blackAlpha' isDisabled={state.matches('loading')}>
          <IconButton aria-label='New document' icon={<AddIcon/>} onClick={createNewDocument}/>
        </ButtonGroup>
      </Flex>

      {state.matches('loading') && !docs.length ? (
        <VStack
          divider={<StackDivider borderColor='gray.300'/>}
          align='stretch'
          mx={-8}
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
          mx={-8}
        >
          {docs.map(doc => (
            <RouterLink to={`/doc/${doc.id}`}>
              <Box 
                px={8}
                py={4}
                bgColor={doc.id === selectedId ? 'gray.300' : undefined}
                cursor='pointer'
              >
                <Link>
                  <Heading fontSize='lg'>{doc.title}</Heading>
                </Link>
                <Text size='sm' color='GrayText'>{doc.contentType}</Text>
              </Box>
            </RouterLink>
          ))}
        </VStack>
      )}

    </Box>
  );
}