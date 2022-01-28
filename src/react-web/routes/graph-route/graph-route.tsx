import React from 'react';
import { NotFoundError } from "@/domain";
import { DocumentEditorProvider } from "@/react-web/components/document-editor-provider";
import { GraphRouteParams } from "@/react-web/config/routes";
import { GraphEditor } from "@/react-web/editors";
import { useDocumentEditorMachine, useStateTransition } from "@/react-web/hooks";
import { useServices } from "@/react-web/services";
import { useAsync, useDebounce } from 'react-use';
import { docToFlowNode, docToGraphNode, linkToFlowEdge, linkToGraphEdge } from '@/react-web/editors/graph-editor/graph-editor-utils';
import { Grid } from '@chakra-ui/react';
import ReactFlow, { FlowElement, ReactFlowProvider, NodeTypesType } from 'react-flow-renderer';
import { DocumentNode } from '@/react-web/components';
import { GraphContent } from '@/content';


const nodeTypes: NodeTypesType = {
  default: DocumentNode
};


export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const services = useServices();
  const [content, setContent] = React.useState<GraphContent>();
  
  // Use the graph search API to populate the graph
  const queryResult = useAsync(() => services.documents.graphByQuery({}), []);
  React.useEffect(() => {
    console.log(queryResult.value);
    if (queryResult.value)
      setContent({
        ...content,
        nodes: queryResult.value.documents.map(docToGraphNode),
        edges: queryResult.value.links.map(linkToGraphEdge)
      });
  }, [queryResult.value]);
  

  return (
    <Grid templateRows='1fr' templateColumns='1fr'>
      <GraphEditor
        content={content}
        onChangeContent={setContent}
      />
    </Grid>
  );
}