import { useGraphEditor } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import { Flex, FlexProps } from '@chakra-ui/layout';
import React from 'react';
import { IoLink, IoUnlink } from 'react-icons/io5';

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

  return (
    <Flex {...props}>
      <ButtonGroup isAttached>
        <IconButton 
          icon={<IoLink/>}
          aria-label='Link documents'
          onClick={handleToggleLinking}
          isActive={state.matches('linkingDocuments')}
        />
        <IconButton
          icon={<IoUnlink/>}
          aria-label='Unlink documents'
          onClick={handleToggleUnlinking}
          isActive={state.matches('unlinkingDocuments')}           
        />
      </ButtonGroup>
    </Flex>
  );
}