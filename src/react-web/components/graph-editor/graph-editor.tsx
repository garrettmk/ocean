import type { DocumentHeader } from '@/domain';
import { useGraphEditor } from '@/react-web/hooks';
import { Box, Grid, GridProps } from '@chakra-ui/layout';
import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useMeasure } from 'react-use';
import ReactFlow, { Background, BackgroundVariant } from 'react-flow-renderer';
import { DocumentNode, Edge } from './components';


export type GraphEditorProps = GridProps & {};


export function GraphEditor(props: GraphEditorProps) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const { state, send } = useGraphEditor();
  const { graph, selectedDocuments, error } = state.context;
  const selected = { from: selectedDocuments[0], to: selectedDocuments[1] };

  // Load the graph on mount
  React.useEffect(() => {
    send({ type: 'loadGraph', payload: {
    }});
  }, []);

  // Create nodes and edges in the format required by react-flow
  const graphElements = React.useMemo(() => [
    ...(graph?.documents ?? []).map((doc, idx) => ({
      id: doc.id,
      type: 'document',
      data: doc,
      position: { x: idx * 10, y: 25 }
    })),

    ...(graph?.links ?? []).map((link, idx) => ({
      id: `${link.from}:${link.to}`,
      source: link.from,
      target: link.to
    }))
  ], [graph]);

  // Respond to node clicks
  const handleNodeClick = React.useCallback((node: any, event: MouseEvent) => {
    const { id } = node;
    send({ type: 'selectDocument', payload: id });
  }, [send]);

  // Selected nodes get a special color!
  const nodeColor = (node: any) => 
    node.id === selected.from ? '#9AE6B4' :
    node.id === selected.to ? '9AE6B4' :
    '#2b6cb0';

  return (    
    <Grid templateRows="1fr" templateColumns="1fr" {...props}>
      <ReactFlow
        elements={graphElements}
        nodeTypes={{ 
          default: DocumentNode,
          document: DocumentNode,
        }}
        edgeTypes={{
          default: Edge
        }}
        connectionLineStyle={{ stroke: 'black' }}
      >

      </ReactFlow>
    </Grid>
  );
}