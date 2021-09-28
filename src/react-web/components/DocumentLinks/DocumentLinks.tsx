import { makeDocumentGraphModel } from '@/client/viewmodels';
import { ID } from '@/domain';
import { DocumentRouteParams, DOCUMENT_ROUTE } from '@/react-web/config/routes';
import { useServices } from '@/react-web/services';
import { Box, BoxProps, Flex } from '@chakra-ui/layout';
import { Heading, IconButton, Link, List, ListIcon, ListItem } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { BiArrowFromLeft } from 'react-icons/bi';
import { MdAdd, MdRemove } from 'react-icons/md';
import { useRoute } from 'wouter';
import { ChooseDocumentModal } from '../ChooseDocumentModal';

export type DocumentLinksProps = BoxProps;

export function DocumentLinks({
  ...boxProps
}: DocumentLinksProps) {
  const [match, params] = useRoute<DocumentRouteParams>(DOCUMENT_ROUTE);
  const services = useServices();
  const machine = React.useMemo(() => makeDocumentGraphModel(services.documents), []);
  const [state, send] = useMachine(machine);
  const { graph, error } = state.context;

  React.useEffect(() => {
    if (!match || !params?.id) return;

    const { id } = params;
    send({ type: 'getDocumentGraph', payload: id });
  }, [params?.id]);


  const [isChooseDocumentOpen, setIsChooseDocumentOpen] = React.useState(false);
  const openChooseDocument = () => setIsChooseDocumentOpen(true);
  const closeChooseDocument = () => setIsChooseDocumentOpen(false);
  const handleAddLink = (id: ID) => {
    if (!match || !params?.id) return;

    send({ type: 'addLink', payload: {
      from: id,
      to: params.id,
      meta: {}
    }});
  }

  return (
    <>
      <ChooseDocumentModal
        isOpen={isChooseDocumentOpen}
        onClose={closeChooseDocument}
        onChoose={handleAddLink}
      />
      <Box
        p={8}
        {...boxProps}
      >
        <Flex alignItems='baseline'>
          <Heading fontSize='sm' mb={4} mr='auto'>
            Document Links:
          </Heading>
          <IconButton aria-label='Add' icon={<MdAdd/>} size='sm' onClick={openChooseDocument}/>
          <IconButton aria-label='Remove' icon={<MdRemove/>} size='sm'/>
        </Flex>
        <List mb={6} spacing={1}>
          {graph?.links.map((link, i) => (
            <ListItem key={i}>
              <ListIcon as={BiArrowFromLeft} color='blue.500'/>
              <Link href=''>{link.from} -- {link.to}</Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
}