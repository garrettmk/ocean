import { ID } from '@/domain';
import { FloatingWindowCloseButton } from '@/react-web/components/floating-window-close-button';
import { createDocumentRoute } from '@/react-web/config/routes';
import { useDocumentEditorMachine, DocumentEditorProvider, DocumentEditorToolbar } from '@/react-web/editors/document-editor';
import { useActor, useStateTransition } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'wouter';
import { FloatingWindow, FloatingWindowProps } from '../floating-window';
import { FloatingWindowHeader } from '../floating-window-header';
import { ContentEditor } from '../../editors/content-editor';


export type FloatingDocumentEditorProps = FloatingWindowProps & {
  documentId?: ID,
  isOpen?: boolean,
  onClose?: () => void,
};


export function FloatingDocumentEditor({
  documentId,
  isOpen,
  onClose,
  ...windowProps
}: FloatingDocumentEditorProps) : JSX.Element {
  const editorToolbarRef = React.useRef<HTMLDivElement | null>(null);
  
  // Navigate to the document route when the button is clicked
  const [_, setLocation] = useLocation();
  const handleViewAsPage = () => documentId ? setLocation(createDocumentRoute(documentId)) : null;

  return (
    <DocumentEditorProvider 
      // @ts-ignore
      editor={documentEditor}
    >
      <FloatingWindow
        display={isOpen ? undefined : 'none'} 
        bg='gray.300'
        {...windowProps}
      >
        <FloatingWindowHeader title={''}>
          <Box 
            ref={editorToolbarRef}
            marginRight='2'
          />
          <DocumentEditorToolbar
            size='sm'
            marginRight='2'
          />
          <ButtonGroup size='sm' isAttached>
            <IconButton 
              aria-label='Open'
              icon={<ExternalLinkIcon color='gray.500'/>}
              onClick={handleViewAsPage}
            />
            <FloatingWindowCloseButton onClick={onClose}/>
          </ButtonGroup>
        </FloatingWindowHeader>
        <ContentEditor
          height='calc(100% - 4rem)'
          toolbarRef={editorToolbarRef}
          toolbarSize='sm'
        />
      </FloatingWindow>
    </DocumentEditorProvider>
  );
}