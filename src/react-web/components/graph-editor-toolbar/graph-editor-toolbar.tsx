import { useGraphEditor } from '@/react-web/hooks';
import { Button, ButtonGroup, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Divider, Flex, FlexProps, Text } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/menu';
import React from 'react';
import { IoLink, IoUnlink } from 'react-icons/io5';
import { VscNewFile } from 'react-icons/vsc';
import { HiOutlineDocumentAdd } from 'react-icons/hi';
import { ImportUrlModal } from '../import-url-modal';
import { TiDeleteOutline } from 'react-icons/ti';



export type GraphEditorToolbarProps = FlexProps & {

};


export function GraphEditorToolbar(props: GraphEditorToolbarProps) : JSX.Element {
  const { state, send } = useGraphEditor();
  
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

  return (
    <>
      <ImportUrlModal 
        isOpen={isImportUrlModalOpen}
        onClose={closeImportUrlModal}
        onImport={handleImport}
      />
      <Flex {...props}>
        <ButtonGroup isAttached color='gray.500'>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='New Document'
              icon={<Icon as={HiOutlineDocumentAdd}/>}
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
          </Menu>

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