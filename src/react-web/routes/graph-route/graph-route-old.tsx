import { ID } from '@/domain';
import {
  FloatingDocumentEditor,
  FloatingDocumentList,
  FloatingWindow,
  FloatingWindowCloseButton,
  FloatingWindowHeader,
  FloatingWindowLayout,
  GraphEditorProvider,
  GraphEditorToolbar,
  GraphSearchInput
} from "@/react-web/components";
import { GraphEditor } from "@/react-web/components/graph-editor-old";
import { GraphRouteParams } from "@/react-web/config/routes";
import { useAppBar, useBooleanSetters, useGraphEditorMachine, useUrlQueryParamArray, useUrlQueryParamBoolean } from '@/react-web/hooks';
import { Flex, Grid } from '@chakra-ui/layout';
import { Portal } from '@chakra-ui/portal';
import React from 'react';


export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const appBar = useAppBar();
  const [selectedDocuments, setSelectedDocuments] = useUrlQueryParamArray('select');
  const [isDocumentListOpen, openDocumentList, closeDocumentList] = useBooleanSetters(useUrlQueryParamBoolean('list', true));
  const [isEditorOpen, openDocumentEditor, closeDocumentEditor] = useBooleanSetters(useUrlQueryParamBoolean('editor', !!selectedDocuments?.length));
  const [isAsideOpen, openAside, closeAside] = useBooleanSetters(useUrlQueryParamBoolean('aside', false));

  // Calculate the layout based on which tool windows are open
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

  // Create a graph editor machine, using the query params for initial state
  const graphEditor = useGraphEditorMachine({ selectedDocuments });
  const { state, send } = graphEditor;

  // If we're in the "ready" state, keep the selection in sync with the URL params
  // If we have at least one document selected, open the editor
  React.useEffect(() => {
    if (state.matches('ready')) {
      setSelectedDocuments(state.context.selectedDocuments);
      if (state.context.selectedDocuments.length)
        openDocumentEditor();
    }
  }, [state.context.selectedDocuments]);

  return (
    <GraphEditorProvider editor={graphEditor}>
      <Portal containerRef={appBar.ref}>
        <Flex justifyContent='space-between'>
          <GraphSearchInput
            w='unset'
            onFocus={openDocumentList}
          />
          <GraphEditorToolbar />
        </Flex>
      </Portal>

      <Grid templateRows='1fr' templateColumns='1fr'>
        <GraphEditor />
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
            documentId={selectedDocuments[0] as ID}
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