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


const nodeTypes: NodeTypesType = {
  default: DocumentNode
};


export function GraphRoute({
  params: { }
}: {
  params: GraphRouteParams
}) {
  const services = useServices();
  const [elements, setElements] = React.useState<FlowElement[]>([]);

  // Use the graph search API to populate the graph
  const queryResult = useAsync(() => services.documents.graphByQuery({}), []);
  React.useEffect(() => {
    if (queryResult.value)
      setElements([
        ...queryResult.value.documents.map(docToFlowNode),
        ...queryResult.value.links.map(linkToFlowEdge)
      ]);
  }, [queryResult.value]);
  

  return (
    <Grid templateRows='1fr' templateColumns='1fr'>
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          nodeTypes={nodeTypes}
        />       
      </ReactFlowProvider>
    </Grid>
  );
}