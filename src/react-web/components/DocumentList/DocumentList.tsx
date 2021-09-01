import React from 'react';
import { useServices } from "@/react-web/services";
import { makeBrowseDocumentsMachine } from "@/client/viewmodels";
import { useMachine } from '@xstate/react';
import { Box, Button, Text, Link } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'wouter';

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

  return (
    <Box
      bgColor='blue.300'
    >
      {docs.map(doc => (
        <Box>
          <RouterLink to={`/doc/${doc.id}`}>
            <Link fontSize='lg'>{doc.title}</Link>
          </RouterLink>
        </Box>
      ))}
      <Button onClick={createNewDocument}>
        New Document
      </Button>
    </Box>
  );
}