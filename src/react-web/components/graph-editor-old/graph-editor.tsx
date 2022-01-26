import { DocumentHeader, DocumentLink, ID } from '@/domain';
import { useGraphEditor } from '@/react-web/hooks';
import { Grid, GridProps } from '@chakra-ui/layout';
import React from 'react';
import ReactFlow, {
  Edge as ReactFlowEdge, isNode, Node as ReactFlowNode, OnConnectEndFunc, OnConnectFunc, OnConnectStartFunc, ReactFlowProvider, useStoreState
} from 'react-flow-renderer';
import { DocumentNode, Edge } from './components';
import './react-flow-overrides.css';
import { docToFlowNode, linkToFlowEdge } from './utils';

export type GraphEditorProps = GridProps & {};


function FlowStateLogger() {
  const state = useStoreState(s => s);
  React.useEffect(() => console.log(state), [state]);

  return <></>;
}


export function GraphEditor(props: GraphEditorProps) {
  const { state, send } = useGraphEditor();
  const { graph, selectedDocuments, error } = state.context;
  const reactFlowInstanceRef = React.useRef<any>();
  const setReactFlowInstance = (instance: any) => reactFlowInstanceRef.current = instance;
  const [graphElements, setGraphElements] = React.useState<any[]>([]);

  // Load the graph on mount
  React.useEffect(() => {
    send({ type: 'loadGraph', payload: {
    }});
  }, []);

  // When the graph changes, translate it into react-flow elements
  React.useEffect(() => {
      setGraphElements([
        ...(graph?.documents ?? []).map(docToFlowNode),
        ...(graph?.links ?? []).map(linkToFlowEdge)
      ]);
  }, [graph]);

  // Select a node when you click on it
  const selectNode = React.useCallback((event: any, element: any) => {
    if (isNode(element))
      send({ type: 'selectDocument', payload: element.id });
  }, [send]);

  // Handle node connections
  const startLinking = React.useCallback<OnConnectStartFunc>((event, params) => {
    send({ type: 'linkDocuments', payload: { from: params.nodeId as ID } })
  }, []);

  const cancelLinking = React.useCallback<OnConnectEndFunc>((event) => {
    send({ type: 'cancel' });
  }, []);

  const linkDocuments = React.useCallback<OnConnectFunc>(({ source, target }) => {
    send({ type: 'selectDocument', payload: target as ID });
  }, []);

  // Moving nodes around
  const updateDocumentPosition = React.useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    const { id, data: meta } = node;
    const { x, y } = node.position;
    // const { width, height } = getNodeContainerElement(event.target as HTMLElement)!.getBoundingClientRect();

    send({ type: 'updateDocument', payload: { id, meta: {
      ...meta, x, y,
    }}});
  }, [send]);

  return (    
    <Grid templateRows="1fr" templateColumns="1fr" {...props}>
      <ReactFlowProvider>
        <ReactFlow
          snapToGrid
          nodeTypes={{ 
            default: DocumentNode,
            document: DocumentNode,
          }}
          edgeTypes={{
            default: Edge
          }}
          elements={graphElements}
          onLoad={setReactFlowInstance}
          // onElementClick={selectNode}
          connectionLineStyle={{ stroke: 'black' }}
          // @ts-ignore
          onConnect={linkDocuments}
          onConnectStart={startLinking}
          onConnectEnd={cancelLinking}
          onNodeDragStop={updateDocumentPosition}
          elementsSelectable={false}
          selectNodesOnDrag={false}
        />
      </ReactFlowProvider>
    </Grid>
  );
}