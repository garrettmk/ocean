import { ID } from '@/domain';
import {
  FloatingDocumentEditor, FloatingDocumentList, FloatingWindow, FloatingWindowCloseButton, FloatingWindowHeader, FloatingWindowLayout, GraphEditorProvider,
  GraphEditorToolbar, GraphSearchInput
} from "@/react-web/components";
import { GraphEditor } from "@/react-web/components/graph-editor";
import { GraphRouteParams } from "@/react-web/config/routes";
import { useAppBar, useGraphEditorMachine } from '@/react-web/hooks';
import { Avatar } from '@chakra-ui/avatar';
import { Flex, Grid } from '@chakra-ui/layout';
import { Portal } from '@chakra-ui/portal';
import React from 'react';

export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const [state, send] = useGraphEditorMachine();
  const appBar = useAppBar();

  const [isDocumentListOpen, setIsDocumentListOpen] = React.useState(true);
  const openDocumentList = () => setIsDocumentListOpen(true);
  const closeDocumentList = () => setIsDocumentListOpen(false);

  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const openDocumentEditor = () => setIsEditorOpen(true);
  const closeDocumentEditor = () => setIsEditorOpen(false);

  const [isAsideOpen, setIsAsideOpen] = React.useState(false);
  const openAside = () => setIsAsideOpen(true);
  const closeAside = () => setIsAsideOpen(false);

  const floatingWindowColumns = React.useMemo(() => {
    const list = isDocumentListOpen ? 3 : 0;
    const aside = isAsideOpen ? 3 : 0;
    const editor = isEditorOpen ? 12 - list - aside : 0;

    return {
      list: `span ${list}`,
      editor: `span ${editor}`,
      aside: `10 / span ${aside}`
    }
  }, [isDocumentListOpen, isAsideOpen, isEditorOpen]);

  React.useEffect(() => {
    const { selectedDocuments } = state.context;
    if (state.matches('ready') && selectedDocuments.length === 1)
      openDocumentEditor();
  }, [state]);

  return (
    <GraphEditorProvider state={state} send={send}>
      <Portal containerRef={appBar.ref}>
        <Flex justifyContent='space-between'>
          <GraphSearchInput
            w='unset'
            onFocus={openDocumentList}
          />
          <GraphEditorToolbar/>
        </Flex>
      </Portal>

      <Grid templateRows='1fr' templateColumns='1fr'>
        <GraphEditor/>
        <FloatingWindowLayout top={`${appBar.measure.bottom + 16}px`}>
          <FloatingDocumentList
            gridColumn={floatingWindowColumns.list}
            isOpen={isDocumentListOpen}
            onClose={closeDocumentList}
          />

          <FloatingDocumentEditor
            gridColumn={floatingWindowColumns.editor}
            isOpen={isEditorOpen}
            onClose={closeDocumentEditor}
          />

          <FloatingWindow
            gridColumn={floatingWindowColumns.aside}
            display={isAsideOpen ? undefined : 'none'}
          >
            <FloatingWindowHeader title='Aside'>
              <FloatingWindowCloseButton onClick={closeAside} />
            </FloatingWindowHeader>
            Right side
          </FloatingWindow>
        </FloatingWindowLayout>
      </Grid>


    </GraphEditorProvider>
  );
}