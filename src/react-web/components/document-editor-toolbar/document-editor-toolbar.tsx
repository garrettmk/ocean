import { useDocumentEditor } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Flex, FlexProps } from '@chakra-ui/layout';
import React from 'react';
import { DocumentContentTypeSelect } from '../document-content-type-select';
import { FiTrash } from 'react-icons/fi';
import { FaRegClone, FaRegSave, FaRegChartBar } from 'react-icons/fa';
import { Tooltip } from '@chakra-ui/react';


export type DocumentEditorToolbarProps = FlexProps;


export function DocumentEditorToolbar(props: DocumentEditorToolbarProps) : JSX.Element {
  const editor = useDocumentEditor();

  return (
    <Flex {...props}>
      <ButtonGroup
        color='gray.500'
        isAttached
      >
        <DocumentContentTypeSelect/>

        <IconButton
          aria-label='Delete Document'
          icon={<Icon as={FiTrash}/>}
        />

        <IconButton
          aria-label='Clone Document'
          icon={<Icon as={FaRegClone}/>}
        />

        <Tooltip label='Save'>
          <IconButton
            aria-label='Save Document'
            icon={<Icon as={FaRegSave}/>}
            onClick={editor.save}
          />
        </Tooltip>

        <IconButton
          aria-label='Analysis'
          icon={<Icon as={FaRegChartBar}/>}
        />
      </ButtonGroup>
    </Flex>
  );
}