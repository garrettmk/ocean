import { ID } from '@/domain';
import { FloatingWindowCloseButton } from '@/react-web/components/floating-window-close-button';
import { createDocumentRoute } from '@/react-web/config/routes';
import { useDocumentEditorMachine, useGraphEditor } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import React from 'react';
import { useLocation } from 'wouter';
import { FloatingWindow, FloatingWindowProps } from '../floating-window';
import { FloatingWindowHeader } from '../floating-window-header';
import { ContentEditor } from '../content-editor';
import { DocumentEditorProvider } from '../document-editor-provider';


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
  const editor = useDocumentEditorMachine();
  
  // Navigate to the document route when the button is clicked
  const [_, setLocation] = useLocation();
  const handleViewAsPage = () => documentId ? setLocation(createDocumentRoute(documentId)) : null;

  // Load the document when the component mounts
  React.useEffect(() => {
    if (documentId)
      editor.openDocument(documentId);
  }, [documentId]);

  return (
    <DocumentEditorProvider editor={editor}>
      <FloatingWindow
        display={isOpen ? undefined : 'none'} 
        bg='gray.300'
        {...windowProps}
      >
        <FloatingWindowHeader title={editor.document?.title ?? ''}>
          <ButtonGroup size='sm'>
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
        />
      </FloatingWindow>
    </DocumentEditorProvider>
  );
}