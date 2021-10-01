import { ID } from '@/domain';
import { Box } from '@chakra-ui/layout';
import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useMeasure } from 'react-use';
import { useServices } from '@/react-web/services';
import { makeGraphModel } from '@/client/viewmodels';
import { useMachine } from '@xstate/react';


export function GraphEditor({
  params: {}
}: { 
  params: {}
}) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const services = useServices();
  const machine = React.useMemo(() => makeGraphModel(services.documents), []);
  const [state, send] = useMachine(machine);
  const { graph, error } = state.context;

  React.useEffect(() => {
    send({ type: 'getGraph', payload: {
    }});
  }, []);

  const graphData = React.useMemo(() => ({
    nodes: graph?.documents ?? [],
    links: graph?.links ?? []
  }), [graph]);

  return (
    <Box
      ref={ref}
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