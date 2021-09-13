import React from 'react';
import { Box, Checkbox, VStack } from "@chakra-ui/react";
import { makeRecommendedLinksMachine } from "@/client/viewmodels";
import { useMachine } from "@xstate/react";
import { useServices } from "@/react-web/services";
import { useRoute } from 'wouter';
import { DocumentLink } from '@/domain';
import e from 'cors';


export function RecommendedLinks() {
  const services = useServices();
  const machine = React.useMemo(() => makeRecommendedLinksMachine(services.documents), []);
  const [state, send] = useMachine(machine);

  const [match, params] = useRoute('/doc/:id');
  React.useEffect(() => {
    if (match && params)
      send({ type: 'fetch', payload: params.id });
  }, [params?.id]);

  const graph = state.context.recommendedLinks;
  const fromDoc = (link: DocumentLink) => graph.documents.find(doc => doc.id === link.from);
  const toDoc = (link: DocumentLink) => graph.documents.find(doc => doc.id === link.to);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value: index } = event.target;
    const link = graph.links[parseInt(index)];
    send({ type: checked ? 'link' : 'unlink', payload: link });
  }


  return (
    <Box maxH='200px' overflowY='auto' gridArea='links'>
      <VStack alignItems='flex-start'>
        {graph?.links.map((link, index) => (
          <Checkbox
            value={index}
            onChange={handleChange}
          >
            {toDoc(link)?.title}
          </Checkbox>
        ))}
      </VStack>
    </Box>
  )
}