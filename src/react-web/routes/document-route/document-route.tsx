import { ContentEditor } from "@/react-web/components/content-editor/content-editor";
import { DocumentContentTypeSelect } from "@/react-web/components/document-content-type-select";
import { DocumentEditorProvider } from "@/react-web/components/document-editor-provider";
import { DocumentTitleInput } from "@/react-web/components/document-title-input/document-title-input";
import { createGraphRoute, DocumentRouteParams } from "@/react-web/config/routes";
import { useAppBar, useDocumentEditorMachine } from "@/react-web/hooks";
import { Button, IconButton } from '@chakra-ui/button';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Divider, Flex } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/react";
import React from 'react';
import { Link as RouteLink } from 'wouter';


export function DocumentRoute({
  params,
}: {
  params: DocumentRouteParams
}) {
  const appBar = useAppBar();
  const nestedAppBarRef = React.useRef<HTMLDivElement>(null);
  const editor = useDocumentEditorMachine();
  const { save, open } = editor;

  // Load the document when the component mounts
  React.useEffect(() => {
    open(params.id);
  }, [params.id]);

  return (
    <DocumentEditorProvider editor={editor}>
      <Portal containerRef={appBar.primary}>
        <RouteLink to={createGraphRoute()}>
          <IconButton aria-label='Back' icon={<ArrowBackIcon color='gray.500' />} variant='solid' />
        </RouteLink>
      </Portal>

      <Portal containerRef={appBar.secondary}>
        <Flex>
          <DocumentTitleInput/>
          <DocumentContentTypeSelect/>
        </Flex>
      </Portal>

      <Portal containerRef={appBar.tertiary}>
        <Flex ref={nestedAppBarRef} flexDirection='row-reverse'>
          <Button colorScheme='blue' variant='solid' onClick={save}>
            Save
          </Button>
          <Divider orientation='vertical' borderColor='gray.500'/>
        </Flex>
      </Portal>

      <ContentEditor toolbarRef={nestedAppBarRef}/>
    </DocumentEditorProvider>
  );
}