import React from 'react';
import { NotFoundError } from "@/domain";
import { DocumentEditorProvider } from "@/react-web/components/document-editor-provider";
import { GraphRouteParams } from "@/react-web/config/routes";
import { GraphEditor } from "@/react-web/editors";
import { useDocumentEditorMachine, useStateTransition } from "@/react-web/hooks";
import { useServices } from "@/react-web/services";
import { useAsync, useDebounce } from 'react-use';
import { docToGraphNode, linkToGraphEdge } from '@/react-web/editors/graph-editor/graph-editor-utils';



export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const services = useServices();
  const userId = services.auth.getUserId();
  const documentEditor = useDocumentEditorMachine(`${userId}-default-graph`);

  // If the default graph is not found, create it, then try again to open
  useStateTransition(documentEditor.state, 'closed', {
    in: (current, previous) => {
      if (current.context.error?.name === NotFoundError.name) {
        services.documents.createDocument({
          title: `Default graph for ${userId}`,
          contentType: 'ocean/graph',
          content: {
            nodes: [],
            edges: []
          }
        }).then(doc => {
          documentEditor.send({ type: 'openDocument', payload: doc.id });
        });
      } else {
        console.log(`Error loading default graph for ${userId}: ${current.context.error?.message}`, current.context.error);
      }
    }
  });

  // Use the graph search API to populate the graph document
  const queryResult = useAsync(() => services.documents.graphByQuery({}), []);
  React.useEffect(() => {
    if (queryResult.value && documentEditor.state.matches('ready'))
      documentEditor.send({
        type: 'editDocument',
        payload: {
          contentType: 'ocean/graph',
          content: {
            nodes: queryResult.value.documents.map(docToGraphNode),
            edges: queryResult.value.links.map(linkToGraphEdge)
          }
        }
      });
  }, [queryResult.value]);
  

  return (
    <DocumentEditorProvider editor={documentEditor}>
      <GraphEditor/>
    </DocumentEditorProvider>
  );
}