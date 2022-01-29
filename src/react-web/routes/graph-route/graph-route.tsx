import { GraphContent } from '@/content';
import { DocumentNode } from '@/react-web/components';
import { GraphRouteParams } from "@/react-web/config/routes";
import { GraphContentEditor } from "@/react-web/editors";
import { useAppBar, useStateTransition } from "@/react-web/hooks";
import { useServices } from "@/react-web/services";
import { ButtonGroup, Grid, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Portal, useToast } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { NodeTypesType } from 'react-flow-renderer';
import { MdOutlineCreate } from 'react-icons/md';
import { makeGraphRouteMachine } from './graph-route-machine';

const nodeTypes: NodeTypesType = {
  default: DocumentNode
};


export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const toast = useToast();
  const appBar = useAppBar();
  const services = useServices();
  const machine = React.useMemo(() => makeGraphRouteMachine(services.documents), []);
  const [state, send] = useMachine(machine);

  // Handlers for GraphEditor
  const content = state.context.content;
  const handleChangeContent = React.useCallback((newContent: GraphContent) => {
    console.log(newContent);
    send({ type: 'contentChanged', payload: newContent});
  }, [send]);


  // Load the graph on mount
  React.useEffect(() => {
    send({ type: 'query', payload: {} });
  }, [])


  // Creating a document
  const handleCreateDocument = React.useCallback((event: React.MouseEvent) => {
    const contentType = (event.target as HTMLButtonElement).value;
    send ({ type: 'createDocument', payload: {
      contentType,
      content: null
    }});
  }, [send]);

  useStateTransition(state, 'creatingDocument', {
    in: (current, previous) => !toast.isActive('createDocument') && toast({
      id: 'createDocument',
      title: 'Creating document',
      description: 'Hold on...',
      status: 'info',
      isClosable: false
    }),

    out: (current, previous) => current.context.error 
      ? toast.update('createDocument', {
        title: 'Error creating document',
        description: current.context.error + '',
        status: 'error',
        isClosable: true,
        duration: 5000
      })
      : toast.update('createDocument', {
        title: 'Great success!',
        description: 'Document created successfully.',
        status: 'success',
        isClosable: true,
        duration: 5000
      })
  });


  return (
    <>
      <Portal containerRef={appBar.ref}>
        <ButtonGroup isAttached>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='New Document'
              icon={<Icon as={MdOutlineCreate}/>}
            />
            <MenuList>
              {/* <MenuItem>Import from URL...</MenuItem> */}
              <MenuItem value='text/plain' onClick={handleCreateDocument}>Plain Text</MenuItem>
              <MenuItem value='application/json;format=slate' onClick={handleCreateDocument}>Slate</MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
      </Portal>
      <Grid templateRows='1fr' templateColumns='1fr'>
        <GraphContentEditor
          content={content}
          onChangeContent={handleChangeContent}
        />
      </Grid>
    </>
  );
}
