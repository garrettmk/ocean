import React from 'react';
import { FlexProps, Flex, ButtonGroup, IconButton } from '@chakra-ui/react';
import { useHTMLEditor } from './html-editor-context';
import { GrSelect, GrEdit } from 'react-icons/gr';
import { CgListTree } from 'react-icons/cg';
import { TiDeleteOutline } from 'react-icons/ti';


export function HTMLEditorToolbar(props: FlexProps) {
  const editor = useHTMLEditor();
  const { selection, replaceRoot, contentEditable, deleteElement } = editor;

  return (
    <Flex {...props}>
      <ButtonGroup isAttached>
        <IconButton
          aria-label='Select Element'
          icon={<GrSelect />}
          onClick={() => selection.isActive ? selection.stop() : selection.start()}
          isActive={selection.isActive}
        />
        <IconButton
          aria-label='Set as root'
          icon={<CgListTree />}
          onClick={() => replaceRoot.isActive ? replaceRoot.stop() : replaceRoot.start()}
          isActive={replaceRoot.isActive}
        />
        <IconButton
          aria-label='Edit'
          icon={<GrEdit/>}
          onClick={() => contentEditable.isActive ? contentEditable.stop() : contentEditable.start() }
          isActive={contentEditable.isActive}
        />
        <IconButton
          aria-label='Delete Element'
          icon={<TiDeleteOutline/>}
          onClick={() => deleteElement.isActive ? deleteElement.stop() : deleteElement.start() }
          isActive={deleteElement.isActive}
        />
      </ButtonGroup>
    </Flex>
  );
}



