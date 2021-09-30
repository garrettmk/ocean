import { ID } from '@/domain';
import { Box } from '@chakra-ui/layout';
import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useMeasure } from 'react-use';
import { useServices } from '@/react-web/services';
import { makeDocumentGraphModel } from '@/client/viewmodels';
import { useMachine } from '@xstate/react';


export function DocumentGraphView({
  id
}: { 
  id: ID
}) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentGraphModel(services.documents), []);
  const [state, send] = useMachine(machine);
  const { graph, error } = state.context;

  React.useEffect(() => {
    send({ type: 'getDocumentGraph', payload: id, depth: 2 });
  }, [id]);

  const graphData = React.useMemo(() => ({
    nodes: graph?.documents ?? [],
    links: graph?.links ?? []
  }), [graph]);

  return (
    <Box
      ref={ref}
      gridArea="content"
      overflow='hidden'
    >
      <ForceGraph2D
        graphData={graphData}
        nodeId='id'
        linkSource='from'
        linkTarget='to'
        width={width}
        height={height}
        nodeLabel='title'
        linkColor={() => 'black'}
        linkDirectionalParticles={1}
      />
    </Box>
  )
}