import { ButtonGroup, ButtonGroupProps, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Flex, FlexProps } from '@chakra-ui/layout';
import { Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaRegChartBar, FaRegClone, FaRegSave } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { IoMdSwap } from 'react-icons/io';
import { DocumentConvertModal } from './document-convert-modal';
import { DocumentDeleteModal } from './document-delete-modal';
import { useCloneDocumentAction } from './use-clone-document-action';
import { useConvertDocumentAction } from './use-convert-document-action';
import { useDeleteDocumentAction } from './use-delete-document-action';
import { useSaveDocumentAction } from './use-save-document-action';


export type DocumentEditorToolbarProps = FlexProps & Pick<ButtonGroupProps, 'size'>;

export function DocumentEditorToolbar(props: DocumentEditorToolbarProps) : JSX.Element {
  const { size, ...flexProps } = props;
  const [canSaveDocument, saveDocument] = useSaveDocumentAction();
  const [canDeleteDocument, deleteDocument] = useDeleteDocumentAction();
  const [canCloneDocument, cloneDocument] = useCloneDocumentAction();
  const [canConvert, convertDocument] = useConvertDocumentAction();

  return (
    <Flex {...flexProps}>
      <ButtonGroup
        size={size}
        color='gray.500'
        isAttached
      >
        <DocumentConvertModal/>
        <Tooltip label='Convert'>
          <IconButton
            aria-label='Convert'
            icon={<Icon as={IoMdSwap}/>}
            onClick={convertDocument}
            disabled={!canConvert}
          />
        </Tooltip>

        <DocumentDeleteModal/>
        <Tooltip label='Delete'>
          <IconButton
            aria-label='Delete Document'
            icon={<Icon as={FiTrash}/>}
            onClick={deleteDocument}
            disabled={!canDeleteDocument}
          />
        </Tooltip>

        <Tooltip label='Clone'>
          <IconButton
            aria-label='Clone Document'
            icon={<Icon as={FaRegClone}/>}
            onClick={cloneDocument}
            disabled={!canCloneDocument}
          />
        </Tooltip>

        <Tooltip label='Save'>
          <IconButton
            aria-label='Save Document'
            icon={<Icon as={FaRegSave}/>}
            onClick={saveDocument}
            disabled={!canSaveDocument}
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