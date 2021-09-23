import { makeBrowseDocumentsMachine } from "@/client/viewmodels";
import { useServices } from "@/react-web/services";
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, BoxProps, Button, Flex, Heading, Link, Menu, MenuButton, MenuItem, MenuList, Skeleton, Spinner, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { Link as RouterLink, useLocation, useRoute } from 'wouter';


export function DocumentList(props: BoxProps) {
  const [location, setLocation] = useLocation();
  const services = useServices();
  const machine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const docs = state.context.documents ?? [];

  const createNewDocument = React.useCallback(async () => {
    const { id } = await services.documents.createDocument({});
    setLocation(`/doc/${id}`);
    send({ type: 'query' });
  }, []);//

  const importDocumentFromUrl = React.useCallback(async () => {
    const { id } = await services.documents.importDocumentFromUrl('https://www.arangodb.com/docs/stable/aql/operations-search.html');
    setLocation(`/doc/${id}`);
    send({ type: 'query' });
  }, []);

  const [match, params] = useRoute('/doc/:id');
  const selectedId = match && params && params.id;

  return (
    <Box
      minW='400px'
      p={8}
      {...props}
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
          <Box mr='auto'>
            <Spinner size='sm' color='GrayText'/>
          </Box>
        ) : (
          <Text color='GrayText' mr='auto'>{docs.length} documents</Text>
        )}
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} colorScheme='blackAlpha'>
            New
          </MenuButton>
          <MenuList>
            <MenuItem onClick={createNewDocument}>Text Document</MenuItem>
            <MenuItem onClick={importDocumentFromUrl}>Import from URL...</MenuItem>
          </MenuList>
        </Menu>
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