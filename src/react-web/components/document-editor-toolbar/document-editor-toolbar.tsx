import { useDocumentEditor, useStateTransition } from '@/react-web/hooks';
import { DocumentEditorMachineState } from '@/react-web/machines';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Flex, FlexProps } from '@chakra-ui/layout';
import { Tooltip, useToast } from '@chakra-ui/react';
import React from 'react';
import { FaRegChartBar, FaRegClone, FaRegSave } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { IoMdSwap } from 'react-icons/io';
import { DocumentConvertModal } from '../document-convert-modal';
import { DocumentDeleteModal } from '../document-delete-modal';

export type DocumentEditorToolbarProps = FlexProps;


export function DocumentEditorToolbar(props: DocumentEditorToolbarProps) : JSX.Element {
  const toast = useToast();
  const editor = useDocumentEditor();

  const saveToastId = 'save-toast';
  useStateTransition(editor.state, 'savingDocument', {
    in: (current, prev) => {
      if (!toast.isActive(saveToastId))
        toast({
          id: saveToastId,
          title: 'Saving Document',
          description: 'Sending data...',
          status: 'info'
        });
    },

    out: (current, prev) => {
      if (current.context.error)
        toast.update(saveToastId, {
          title: 'Error saving document',
          description: current.context.error + '',
          status: 'error',
          isClosable: true
        });
      else
        toast.update(saveToastId, {
          title: 'Document saved',
          description: 'The documen was saved successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
    }
  });

  return (
    <Flex {...props}>
      <ButtonGroup
        color='gray.500'
        isAttached
      >
        <DocumentConvertModal/>
        <Tooltip label='Convert'>
          <IconButton
            aria-label='Convert'
            icon={<Icon as={IoMdSwap}/>}
            onClick={editor.convertDocument}
            disabled={!editor.state.nextEvents.includes('convertDocument')}
          />
        </Tooltip>

        <DocumentDeleteModal/>
        <Tooltip label='Delete'>
          <IconButton
            aria-label='Delete Document'
            icon={<Icon as={FiTrash}/>}
            onClick={editor.deleteDocument}
            disabled={!editor.state.nextEvents.includes('deleteDocument')}
          />
        </Tooltip>

        <Tooltip label='Clone'>
          <IconButton
            aria-label='Clone Document'
            icon={<Icon as={FaRegClone}/>}
            onClick={editor.cloneDocument}
            disabled={!editor.state.nextEvents.includes('cloneDocument')}
          />
        </Tooltip>

        <Tooltip label='Save'>
          <IconButton
            aria-label='Save Document'
            icon={<Icon as={FaRegSave}/>}
            onClick={editor.saveDocument}
            disabled={!editor.state.nextEvents.includes('saveDocument')}
          />
        </Tooltip>

        <Tooltip label='Content Analysis'>
          <IconButton
            aria-label='Analysis'
            icon={<Icon as={FaRegChartBar}/>}
          />
        </Tooltip>
      </ButtonGroup>
    </Flex>
  );
}