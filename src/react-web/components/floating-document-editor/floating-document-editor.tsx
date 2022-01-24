import { ID } from '@/domain';
import { FloatingWindowCloseButton } from '@/react-web/components/floating-window-close-button';
import { createDocumentRoute } from '@/react-web/config/routes';
import { useActor, useDocumentEditor, useDocumentEditorMachine, useGraphEditor, useStateTransition } from '@/react-web/hooks';
import { ButtonGroup, IconButton } from '@chakra-ui/button';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'wouter';
import { FloatingWindow, FloatingWindowProps } from '../floating-window';
import { FloatingWindowHeader } from '../floating-window-header';
import { ContentEditor } from '../content-editor';
import { DocumentEditorProvider } from '../document-editor-provider';
import { DocumentEditorToolbar } from '../document-editor-toolbar';


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
  const graphEditor = useGraphEditor()
  const documentEditor = useActor(graphEditor.state.context.editors?.[documentId!]);
  const editorToolbarRef = React.useRef<HTMLDivElement | null>(null);

  // Open the editor if it isn't already open
  React.useEffect(() => {
    if (!documentEditor && documentId)
      graphEditor.send({ type: 'editDocument', payload: documentId });
  }, [documentEditor, documentId]);
  
  // Navigate to the document route when the button is clicked
  const [_, setLocation] = useLocation();
  const handleViewAsPage = () => documentId ? setLocation(createDocumentRoute(documentId)) : null;

  // Close the document if deleted
  useStateTransition(documentEditor?.state, 'deletingDocument.deleting', {
    out: (current, previous) => {
      if (!current.context.error)
        onClose?.();
    }
  });

  return (
    <DocumentEditorProvider editor={documentEditor}>
      <FloatingWindow
        display={isOpen ? undefined : 'none'} 
        bg='gray.300'
        {...windowProps}
      >
        <FloatingWindowHeader title={documentEditor?.state?.context.document?.title ?? ''}>
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