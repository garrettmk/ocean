import { makeOpenDocumentMachine } from "@/client/viewmodels";
import { useServices } from "@/react-web/services";
import React from "react";
import { useMachine } from '@xstate/react';
import { Box } from "@chakra-ui/layout";
import { Button, Input, Textarea } from "@chakra-ui/react";


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
  }, [id]);

  const editTitle = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    send({ type: 'edit', payload: { title: event.target.value } });
  }, []);

  const editContent = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    send({ type: 'edit', payload: {
      contentType: 'text/plain',
      content: event.target.value,
    }})
  }, []);

  const saveDocument = React.useCallback(() => {
    send({ type: 'save' })
  }, []);

  if (!document)
    return <>'Loading...'</>;

  return (
    <Box>
      <Input size='lg' value={document.title} onChange={editTitle}/>
      <Textarea value={document.content} onChange={editContent}/>
      <Button
        disabled={!state.matches('edited')}
        onClick={saveDocument}
      >
        Save
      </Button>
      <pre>
        {JSON.stringify(state, null, '  ')}
      </pre>
    </Box>
  );
}