import React from 'react';
import { FlexProps, Flex, ButtonGroup, IconButton, Icon } from '@chakra-ui/react';
import { useHTMLEditor } from './html-editor-context';
import { CgListTree } from 'react-icons/cg';
import { TiDeleteOutline } from 'react-icons/ti';
import { MdEdit } from 'react-icons/md';


export function HTMLEditorToolbar(props: FlexProps) {
  const editor = useHTMLEditor();
  const { embed, selection, replaceRoot, contentEditable, deleteElement } = editor;

  // Don't follow links if we clicked on an element during an operation
  React.useEffect(() => {
    if (replaceRoot.isActive || deleteElement.isActive) {
      const eventListener = (event: Event) => {
        event.preventDefault();
      }

      embed.current?.shadowRoot?.addEventListener('click', eventListener);

      return () => {
        embed.current?.shadowRoot?.removeEventListener('click', eventListener);
      };
    }
  }, [replaceRoot.isActive, deleteElement.isActive]);
  

  return (
    <Flex {...props}>
      <ButtonGroup color='gray.500' isAttached>
        <IconButton
          aria-label='Set as root'
          icon={<Icon as={CgListTree}/>}
          onClick={() => replaceRoot.isActive ? replaceRoot.stop() : replaceRoot.start()}
          isActive={replaceRoot.isActive}
        />
        <IconButton
          aria-label='Edit'
          icon={<Icon as={MdEdit}/>}
          onClick={() => contentEditable.isActive ? contentEditable.stop() : contentEditable.start() }
          isActive={contentEditable.isActive}
        />
        <IconButton
          aria-label='Delete Element'
          icon={<Icon as={TiDeleteOutline}/>}
          onClick={() => deleteElement.isActive ? deleteElement.stop() : deleteElement.start() }
          isActive={deleteElement.isActive}
        />
      </ButtonGroup>
    </Flex>
  );
}



