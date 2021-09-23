import React from 'react';
import { FlexProps, Flex, ButtonGroup, IconButton } from '@chakra-ui/react';
import { useHTMLEditor } from './html-editor-context';
import { GrSelect, GrEdit } from 'react-icons/gr';
import { CgListTree } from 'react-icons/cg';


export function HTMLEditorToolbar(props: FlexProps) {
  const editor = useHTMLEditor();
  const { selection, replaceRoot, contentEditable } = editor;

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
      </ButtonGroup>
    </Flex>
  );
}



