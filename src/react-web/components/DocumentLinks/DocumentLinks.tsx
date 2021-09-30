import { makeDocumentGraphModel } from '@/client/viewmodels';
import { ID } from '@/domain';
import { DocumentRouteParams, DOCUMENT_ROUTE } from '@/react-web/config/routes';
import { useServices } from '@/react-web/services';
import { Box, BoxProps, Flex } from '@chakra-ui/layout';
import { Heading, IconButton, Link, List, ListIcon, ListItem } from '@chakra-ui/react';
import { useMachine } from '@xstate/react';
import React from 'react';
import { BiArrowFromLeft, BiArrowFromRight } from 'react-icons/bi';
import { MdAdd, MdRemove } from 'react-icons/md';
import { useRoute, Link as RouterLink } from 'wouter';
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

  const handleRemoveLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    const from = event.currentTarget.dataset['from'];
    const to = event.currentTarget.dataset['to'];

    send({ type: 'removeLink', payload: {
      from,
      to
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
          {graph?.links.map((link, i) => {
            const key = `${link.from}-${link.to}`;
            const icon = link.from === params!.id ? BiArrowFromLeft : BiArrowFromRight;
            const documentId = link.from === params!.id ? link.to : link.from;
            const document = graph.documents.find(doc => doc.id === documentId)!;
            
            return (
              <ListItem
                key={key}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                position="relative"
                pr="8"
              >
                <ListIcon as={icon} color='blue.500'/>
                <RouterLink href={`/doc/${document.id}`}>
                  <Link>
                    {document.title}
                  </Link>
                </RouterLink>
                <IconButton
                  aria-label="Remove"
                  icon={<MdRemove/>}
                  size="xs"
                  position="absolute"
                  right="0"
                  data-from={link.from}
                  data-to={link.to}
                  onClick={handleRemoveLink}
                />
              </ListItem>
            )
          })}
        </List>
      </Box>
    </>
  );
}