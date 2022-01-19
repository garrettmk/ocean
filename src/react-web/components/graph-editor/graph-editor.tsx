import { DocumentHeader, DocumentLink, ID } from '@/domain';
import { useGraphEditor, useStateTransition } from '@/react-web/hooks';
import { Grid, GridProps } from '@chakra-ui/layout';
import ELK, { ElkEdge, ElkNode } from 'elkjs';
import React from 'react';
import { DocumentNode, Edge } from './components';
import './react-flow-overrides.css';
import ReactFlow, { 
  ReactFlowProvider, 
  isNode, 
  OnConnectStartFunc, 
  OnConnectEndFunc, 
  Connection,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  OnConnectFunc
} from 'react-flow-renderer';
import { State } from 'xstate';
import { GraphEditorContext, GraphEditorEvent, GraphEditorMachineState } from '@/client/viewmodels';

export type GraphEditorProps = GridProps & {};


export function GraphEditor(props: GraphEditorProps) {
  const { state, send } = useGraphEditor();
  const { graph, selectedDocuments, error } = state.context;
  const reactFlowInstanceRef = React.useRef<any>();
  const setReactFlowInstance = (instance: any) => reactFlowInstanceRef.current = instance;
  const [graphElements, setGraphElements] = React.useState<any[]>([]);
  const elk = React.useMemo(() => new ELK(), []);
  
  const layoutGraph = React.useCallback(async () => {
    // Describe the graph in ELK JSON format and tell elk to lay it out
    const layout = await elk.layout({
      id: 'root',
      layoutOptions: { 'algorithm': 'layered', 'elk.direction': 'DOWN' },
      children: (graph?.documents ?? []).map(docToElkNode),
      edges: (graph?.links ?? []).map(linkToElkEdge)
    });
    
    // Use the layout result to create elements in the format
    // used by react-flow
    setGraphElements([
      ...(layout.children ?? []).map(elkNodeToFlowNode),
      ...(layout.edges ?? []).map(elkEdgeToFlowEdge)
    ]);

    // Fit the viewport to the graph
    // but make sure it happens after the data updates
    setTimeout(() => {
      reactFlowInstanceRef.current.fitView();
    }, 0);    
  }, [graph]);

  
  // Load the graph on mount
  React.useEffect(() => {
    send({ type: 'loadGraph', payload: {
    }});
  }, []);

  // When the graph changes, translate it into react-flow elements
  React.useEffect(() => {
    if (state.history?.matches('loading'))
      layoutGraph();
    else
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

  return (    
    <Grid templateRows="1fr" templateColumns="1fr" {...props}>
      <ReactFlowProvider>
        <ReactFlow
          nodeTypes={{ 
            default: DocumentNode,
            document: DocumentNode,
          }}
          edgeTypes={{
            default: Edge
          }}
          elements={graphElements}
          onLoad={setReactFlowInstance}
          onElementClick={selectNode}
          connectionLineStyle={{ stroke: 'black' }}
          // @ts-ignore
          onConnect={linkDocuments}
          onConnectStart={startLinking}
          onConnectEnd={cancelLinking}
        />
      </ReactFlowProvider>
    </Grid>
  );
}


function docToElkNode(doc: DocumentHeader) : ElkNode {
  return {
    // @ts-ignore
    data: doc,
    id: doc.id,
    x: doc.meta?.layout?.x,
    y: doc.meta?.layout?.y,
    width: doc.meta?.layout?.width ?? 250,
    height: doc.meta?.layout?.height ?? 100
  };
}

function linkToElkEdge(link: DocumentLink) : ElkEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    sources: [link.from],
    targets: [link.to],
  };
}

function elkNodeToFlowNode(node: ElkNode) : ReactFlowNode {
  return {
    // @ts-ignore
    data: node.data,
    id: node.id,
    position: { x: node.x!, y: node.y! },
    dragHandle: '#draghandle',
  };
}

function elkEdgeToFlowEdge(edge: ElkEdge) : ReactFlowEdge {
  return {
    // @ts-ignore
    data: edge.data,
    id: edge.id,
    // @ts-ignore
    source: edge.sources[0],
    // @ts-ignore
    target: edge.targets[0],
  }
}

function docToFlowNode(doc: DocumentHeader) : ReactFlowNode {
  return {
    // @ts-ignore
    data: doc,
    id: doc.id,
    dragHandle: '#draghandle',
    position: {
      x: doc.meta?.layout?.x ?? 250,
      y: doc.meta?.layout?.y ?? 250,
    },
  };
}

function linkToFlowEdge(link: DocumentLink) : ReactFlowEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    source: link.from,
    target: link.to
  };
}