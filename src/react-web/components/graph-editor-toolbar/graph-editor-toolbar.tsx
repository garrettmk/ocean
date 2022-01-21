import { useGraphEditor, useStateTransition } from '@/react-web/hooks';
import { ButtonGroup, ButtonGroupProps, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Flex, FlexProps } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { useToast } from '@chakra-ui/toast';
import React from 'react';
import { AiOutlineSisternode } from 'react-icons/ai';
import { IoLink, IoUnlink } from 'react-icons/io5';
import { ImportUrlModal } from '../import-url-modal';
import { FaSitemap } from 'react-icons/fa';



export type GraphEditorToolbarProps = FlexProps & {
  toolbarSize?: ButtonGroupProps['size'],
};


export function GraphEditorToolbar({ toolbarSize, ...flexProps }: GraphEditorToolbarProps = {}) : JSX.Element {
  const { state, send } = useGraphEditor();
  const toast = useToast();
  
  const handleToggleLinking = () => {
    const isLinking = state.matches('linkingDocuments');
    const isReady = state.matches('ready');

    if (isReady)
      send({ type: 'linkDocuments' });
    if (isLinking)
      send({ type: 'cancel' });
    else
      send([
        { type: 'cancel' },
        { type: 'linkDocuments' }
      ]);
  };

  const handleToggleUnlinking = () => {
    const isUnlinking = state.matches('unlinkingDocuments');
    const isReady = state.matches('ready');

    if (isReady)
      send({ type: 'unlinkDocuments' });
    if (isUnlinking)
      send({ type: 'cancel' });
    else
      send([
        { type: 'cancel' },
        { type: 'unlinkDocuments' }
      ]);
  };

  const [isImportUrlModalOpen, setIsImportModalOpen] = React.useState(false);
  const openImportUrlModal = () => setIsImportModalOpen(true);
  const closeImportUrlModal = () => setIsImportModalOpen(false);
  const handleImport = (url: string) => { closeImportUrlModal(); send({ type: 'importUrl', payload: url }) };
  React.useEffect(() => {
    // @ts-ignore
    if (state.matches('ready') && state.event.type === 'done.invoke.importUrl') {

      // @ts-ignore
      send({ type: 'selectDocument', payload: state.event.data.id });
    }
  }, [state]);


  const handleCreateDocument = (event: React.MouseEvent<HTMLButtonElement>) => {
    const contentType = (event.target as HTMLButtonElement).value;

    send({ type: 'createDocument', payload: {
      title: 'Untitled',
      contentType,
    } });
  }

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


  const handleLayoutGraph = () => {
    send({ type: 'layoutGraph' });
  };

  useStateTransition(state, 'layingOutGraph', {
    in: () => !toast.isActive('layoutGraph') && toast({
      id: 'layoutGraph',
      title: 'Layout Graph',
      description: 'Calculating...',
      status: 'info',
      isClosable: false,
    }),

    out: (current) => current.context.error
      ? toast.update('layoutGraph', {
        title: 'Layout Graph',
        description: current.context.error + '',
        status: 'error',
        isClosable: true,
        duration: 5000
      })
      : toast.update('layoutGraph', {
        title: 'Great success!',
        description: 'Layout applied.',
        status: 'success',
        isClosable: true,
        duration: 5000
      })
  });
  
  return (
    <>
      <ImportUrlModal 
        isOpen={isImportUrlModalOpen}
        onClose={closeImportUrlModal}
        onImport={handleImport}
      />
      <Flex {...flexProps}>
        <ButtonGroup isAttached color='gray.500' size={toolbarSize}>
          <IconButton
            icon={<Icon as={FaSitemap}/>}
            aria-label='Layout Graph'
            onClick={handleLayoutGraph}
            disabled={!state.matches('ready')}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='New Document'
              icon={<Icon as={AiOutlineSisternode}/>}
            />
            <MenuList
              shadow='2xl'
              borderWidth='thin'
              borderColor='gray.300'
              color='black'
            >
              <MenuItem onClick={openImportUrlModal}>Import from URL...</MenuItem>
              <MenuItem value='text/plain' onClick={handleCreateDocument}>Plain Text</MenuItem>
              <MenuItem value='application/json;format=slate' onClick={handleCreateDocument}>Slate</MenuItem>
            </MenuList>
          </Menu>
{/* 
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='New Document'
              icon={<Icon as={AiOutlineSubnode}/>}
            />
            <MenuList
              shadow='2xl'
              borderWidth='thin'
              borderColor='gray.300'
              color='black'
            >
              <MenuItem onClick={openImportUrlModal}>Import from URL...</MenuItem>
              <MenuItem>Plain Text</MenuItem>
              <MenuItem>Slate</MenuItem>
            </MenuList>
          </Menu> */}

          <Box
            bgColor='gray.400'
            m='2'
            w='1px'
          />

          <IconButton 
            icon={<Icon as={IoLink}/>}
            aria-label='Link documents'
            onClick={handleToggleLinking}
            isActive={state.matches('linkingDocuments')}
          />
          <IconButton
            icon={<Icon as={IoUnlink}/>}
            aria-label='Unlink documents'
            onClick={handleToggleUnlinking}
            isActive={state.matches('unlinkingDocuments')}           
          />
        </ButtonGroup>
      </Flex>
    </>
  );
}