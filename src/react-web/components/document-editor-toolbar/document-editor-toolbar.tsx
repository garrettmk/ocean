import { useDocumentEditor } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Flex, FlexProps } from '@chakra-ui/layout';
import { Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaRegChartBar, FaRegClone, FaRegSave } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { IoMdSwap } from 'react-icons/io';
import { DocumentConvertModal } from '../document-convert-modal';
import { DocumentDeleteModal } from '../document-delete-modal';

export type DocumentEditorToolbarProps = FlexProps;


export function DocumentEditorToolbar(props: DocumentEditorToolbarProps) : JSX.Element {
  const editor = useDocumentEditor();

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