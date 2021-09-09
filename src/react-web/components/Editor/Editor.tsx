import { makeOpenDocumentMachine } from "@/client/viewmodels";
import { useServices } from "@/react-web/services";
import React from "react";
import { useMachine } from '@xstate/react';
import { Box } from "@chakra-ui/layout";
import { Button, Container, Flex, Input, Textarea } from "@chakra-ui/react";


export function Editor({
  params: { id }
}: React.PropsWithChildren<{
  params: { id: string }
}>) {
  const services = useServices();
  const machine = React.useMemo(() => makeOpenDocumentMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const document = state.context.document;

  React.useEffect(() => {
    send({ type: 'open', payload: id });
  }, [id, send]);

  const editTitle = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    send({ type: 'edit', payload: { title: event.target.value } });
  }, [send]);

  const editContent = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    send({ type: 'edit', payload: {
      contentType: 'text/plain',
      content: event.target.value,
    }})
  }, [send]);

  const saveDocument = React.useCallback(() => {
    send({ type: 'save' })
  }, [send]);

  if (!document)
    return <>'Loading...'</>;

  return (
    <Box p={8}>
      <Container maxW='container.md'>
        <Flex minH={8} alignItems='center'>
          <Input size='lg' value={document.title} onChange={editTitle}/>
          <Button
            disabled={!state.matches('edited')}
            onClick={saveDocument}
          >
            Save
          </Button>
        </Flex>
        <Textarea pt={8} value={document.content as string} onChange={editContent}/>
      </Container>
      <pre>
        {JSON.stringify(state, null, '  ')}
      </pre>
    </Box>
  );
}