import { makeOpenDocumentMachine } from '@/client/viewmodels';
import { useServices } from '@/react-web/services';
import { Box, Button, Container, Flex, Input } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';


const DEFAULT_CONTENT = [
  {
    type: 'paragraph',
    children: [
      { text: '' }
    ]
  }
]

export function SlateEditor({
  params: { id }
}: React.PropsWithChildren<{
  params: { id: string }
}>) {
  const services = useServices();
  const machine = React.useMemo(() => makeOpenDocumentMachine(services.documents), []);
  const [state, send] = useMachine(machine);

  React.useEffect(() => {
    send({ type: 'open', payload: id });
  }, [id]);

  const document = state.context.document;
  
  const title = document?.title ?? '';
  const setTitle = (event: React.ChangeEvent<HTMLInputElement>) => send({
    type: 'edit',
    payload: {
      title: event.target.value,
    }
  });
  
  const value = document?.content || DEFAULT_CONTENT;
  const setValue = (newValue: any) => send({
    type: 'edit',
    payload: {
      contentType: 'application/json',
      content: newValue
    }
  });

  const saveDocument = () => send({
    type: 'save'
  });
  
  const editor = React.useMemo(() => withReact(createEditor()), []);

  return (
    <Slate
      editor={editor}
      // @ts-ignore
      value={value}
      onChange={setValue}
    >
      <Box p={8} h='100%'>
        <Container maxW='container.md' h='100%'>
          <Flex minH={8} alignItems='center'>
            <Input size='lg' value={title} onChange={setTitle}/>
            <Button
              disabled={!state.matches('edited')}
              onClick={saveDocument}
            >
              Save
            </Button>
          </Flex>
          <Editable
            style={{
              height: '100%'
            }}
          />
        </Container>
      </Box>
    </Slate>
  );
}