import { useGraphEditor } from '@/react-web/hooks';
import { Grid, GridProps } from '@chakra-ui/layout';
import ELK from 'elkjs';
import React from 'react';
import ReactFlow, { ReactFlowProvider, isNode } from 'react-flow-renderer';
import { DocumentNode, Edge } from './components';
import './react-flow-overrides.css';


export type GraphEditorProps = GridProps & {};


export function GraphEditor(props: GraphEditorProps) {
  const { state, send } = useGraphEditor();
  const { graph, selectedDocuments, error } = state.context;
  const reactFlowInstanceRef = React.useRef<any>();
  const setReactFlowInstance = (instance: any) => reactFlowInstanceRef.current = instance;

  // Load the graph on mount
  React.useEffect(() => {
    send({ type: 'loadGraph', payload: {
    }});
  }, []);

  // When the graph changes, use ELK to layout the nodes
  const [graphElements, setGraphElements] = React.useState<any[]>([]);
  const elk = React.useMemo(() => new ELK(), []);

  React.useEffect(() => {
    // Describe the graph in ELK JSON format and tell elk to lay it out
    elk.layout({
      id: 'root',
      layoutOptions: { 'algorithm': 'layered', 'elk.direction': 'DOWN' },
      children: (graph?.documents ?? []).map(doc => ({
        data: doc,
        id: doc.id,
        width: 250,
        height: 250
      })),
      edges: (graph?.links ?? []).map(link => ({
        data: link,
        id: `${link.from}:${link.to}`,
        sources: [link.from],
        targets: [link.to],
      }))
    }).then(layout => {
      // Use the layout result to create elements in the format
      // used by react-flow
      setGraphElements([
        ...(layout.children ?? []).map(child => ({
          id: child.id,
          position: { x: child.x, y: child.y },
          // @ts-ignore
          data: child.data,
          dragHandle: '#draghandle',
        })),

        ...(layout.edges ?? []).map(edge => ({
          id: edge.id,
          // @ts-ignore
          source: edge.sources[0],
          // @ts-ignore
          target: edge.targets[0],
          // @ts-ignore
          data: edge.data
        }))
      ]);

      // Fit the viewport to the graph
      setTimeout(() => {
        reactFlowInstanceRef.current.fitView();
      }, 0);
      
    }).catch(console.error);
  }, [graph]);

  // Respond to node clicks
  const handleElementClick = React.useCallback((event: any, element: any) => {
    console.log(event);
    if (isNode(element))
      send({ type: 'selectDocument', payload: element.id });
  }, [send]);

  return (    
    <Grid templateRows="1fr" templateColumns="1fr" {...props}>
      <ReactFlowProvider>
        <ReactFlow
          onLoad={setReactFlowInstance}
          onElementClick={handleElementClick}
          elements={graphElements}
          nodeTypes={{ 
            default: DocumentNode,
            document: DocumentNode,
          }}
          edgeTypes={{
            default: Edge
          }}
          connectionLineStyle={{ stroke: 'black' }}
        />
      </ReactFlowProvider>
    </Grid>
  );
}