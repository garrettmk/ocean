import type { DocumentHeader } from '@/domain';
import { useGraphEditor } from '@/react-web/hooks';
import { Box, Grid, GridProps } from '@chakra-ui/layout';
import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useMeasure } from 'react-use';


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

  // Put the data in the format required by ForceGraph2D
  const graphData = React.useMemo(() => ({
    nodes: graph?.documents ?? [],
    links: graph?.links ?? []
  }), [graph]);

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
      <Box ref={ref} overflow='hidden'>
        <ForceGraph2D
          graphData={graphData}
          nodeId='id'
          linkSource='from'
          linkTarget='to'
          width={width}
          height={height}
          nodeLabel='title'
          backgroundColor='#CBD5E0'
          nodeColor={nodeColor}
          linkColor={() => 'black'}
          linkDirectionalParticles={1}
          onNodeClick={handleNodeClick}
        />
      </Box>  
    </Grid>
  );
}