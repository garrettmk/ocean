import { ContentEditor } from "@/react-web/editors/content-editor";
import { DocumentTitleInput } from "@/react-web/editors/document-editor/document-title-input";
import { createGraphRoute, DocumentRouteParams } from "@/react-web/config/routes";
import { DocumentEditorProvider, DocumentEditorToolbar, useDocumentEditorMachine } from "@/react-web/editors/document-editor";
import { useAppBar } from "@/react-web/app";
import { IconButton } from '@chakra-ui/button';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/react";
import React from 'react';
import { Link as RouteLink } from 'wouter';

export function DocumentRoute({
  params,
}: {
  params: DocumentRouteParams
}) {
  const appBar = useAppBar();
  const contentEditorToolbarRef = React.useRef<HTMLDivElement>(null);
  const { documentEditor } = useDocumentEditorMachine({
    documentId: params.id,
    start: true
  });
  
  return (
    <DocumentEditorProvider editor={documentEditor}>
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