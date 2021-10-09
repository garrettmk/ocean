import { ContentEditor } from "@/react-web/components/content-editor/content-editor";
import { DocumentContentTypeSelect } from "@/react-web/components/document-content-type-select";
import { DocumentEditorProvider } from "@/react-web/components/document-editor-provider";
import { DocumentTitleInput } from "@/react-web/components/document-title-input/document-title-input";
import { createGraphRoute, DocumentRouteParams } from "@/react-web/config/routes";
import { useAppBar, useDocumentEditorMachine } from "@/react-web/hooks";
import { Button, ButtonGroup, IconButton } from '@chakra-ui/button';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/react";
import React from 'react';
import { Link as RouteLink } from 'wouter';
import { DocumentEditorToolbar } from "@/react-web/components/document-editor-toolbar";

export function DocumentRoute({
  params,
}: {
  params: DocumentRouteParams
}) {
  const appBar = useAppBar();
  const contentEditorToolbarRef = React.useRef<HTMLDivElement>(null);
  const editor = useDocumentEditorMachine();
  const { save, open } = editor;

  // Load the document when the component mounts
  React.useEffect(() => {
    open(params.id);
  }, [params.id]);

  return (
    <DocumentEditorProvider editor={editor}>
      <Portal containerRef={appBar.ref}>
        <Flex alignItems='center'>
          <RouteLink to={createGraphRoute()}>
            <IconButton aria-label='Back' icon={<ArrowBackIcon color='gray.500' />} variant='solid' />
          </RouteLink>

          <DocumentTitleInput size='lg'/>
        
          <Flex justifyContent='flex-end' position='relative' flex='0 0 auto' ml='2rem'>
            <DocumentEditorToolbar/>
            <Box
              position='absolute'
              top='100%'
              right='0'
              ref={contentEditorToolbarRef} bg='white'
            />
          </Flex>
        </Flex>
      </Portal>

      <Box position='relative'>
        <ContentEditor toolbarRef={contentEditorToolbarRef}/>
      </Box>
    </DocumentEditorProvider>
  );
}