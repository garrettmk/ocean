import React from 'react';
import { ID } from '@/domain';
import { GraphEditor } from "@/react-web/components/graph-editor";
import { GraphRouteParams } from "@/react-web/config/routes";
import { Grid } from "@chakra-ui/layout";
import {
  FloatingWindowLayout,
  FloatingDocumentList,
  FloatingDocumentEditor,
  FloatingWindow,
  FloatingWindowHeader,
  FloatingWindowCloseButton,
  GraphSearchInput,
  GraphEditorProvider,
  GraphEditorToolbar,
} from "@/react-web/components";
import { useAppBar, useGraphEditorMachine } from '@/react-web/hooks';
import { ButtonGroup, Button } from '@chakra-ui/button';
import { Avatar } from '@chakra-ui/avatar';
import { Portal } from '@chakra-ui/portal';

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

  const [editorDocumentId, setEditorDocumentId] = React.useState<ID | undefined>(undefined);
  const openDocumentEditor = (id: ID) => setEditorDocumentId(id);
  const closeDocumentEditor = () => setEditorDocumentId(undefined);

  const [isAsideOpen, setIsAsideOpen] = React.useState(false);
  const openAside = () => setIsAsideOpen(true);
  const closeAside = () => setIsAsideOpen(false);

  const floatingWindowColumns = React.useMemo(() => {
    const list = isDocumentListOpen ? 3 : 0;
    const aside = isAsideOpen ? 3 : 0;
    const editor = Boolean(editorDocumentId) ?
      12 - list - aside : 0;

    return {
      list: `span ${list}`,
      editor: `span ${editor}`,
      aside: `10 / span ${aside}`
    }
  }, [isDocumentListOpen, isAsideOpen, Boolean(editorDocumentId)]);

  return (
    <GraphEditorProvider state={state} send={send}>
      <Portal containerRef={appBar.primary}>
        <GraphSearchInput onFocus={openDocumentList} />
      </Portal>

      <Portal containerRef={appBar.secondary}>
        <GraphEditorToolbar/>
      </Portal>

      <Portal containerRef={appBar.tertiary}>
        <Avatar
          onClick={openAside}
        />
      </Portal>

      <FloatingWindowLayout top={`${appBar.measure.bottom + 16}px`}>
        <FloatingDocumentList
          gridColumn={floatingWindowColumns.list}
          isOpen={isDocumentListOpen}
          onClose={closeDocumentList}
          onSelect={({ id }) => openDocumentEditor(id)}
        />

        <FloatingDocumentEditor
          gridColumn={floatingWindowColumns.editor}
          isOpen={!!editorDocumentId}
          onClose={closeDocumentEditor}
          documentId={editorDocumentId}
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

      <GraphEditor/>
    </GraphEditorProvider>
  );
}