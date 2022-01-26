import { DocumentHeader } from '@/domain';
import { ContentEditor, ResizeHandle } from '@/react-web/components';
import { useActor, useFocus, useGraphEditor, useHover } from '@/react-web/hooks';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, ButtonGroup, Collapse, Fade, Flex, Grid, Icon, IconButton, Input, Portal, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { DocumentEditorProvider } from '../../document-editor-provider';
import { DocumentEditorToolbar } from '../../document-editor-toolbar';
import { useNodeResizing } from '../hooks';
import { canElementScroll } from '@/react-web/utils';
import { useLocation } from 'wouter';
import { createDocumentRoute } from '@/react-web/config/routes';


export function DocumentNode({
  id,
  data,
  type,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<DocumentHeader>) {
  // Keep a ref to the root element, and to the toolbar element
  // also the content container
  const rootRef = React.useRef<HTMLDivElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const contentContainerRef = React.useRef<HTMLDivElement>(null);

  // Hook in to the local graph editor
  // And document editor for this ID, if it exists
  const graphEditor = useGraphEditor();
  const documentEditor = useActor(graphEditor.state.context.editors?.[id]);


  // Track whether the node is in open (edit) mode
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: data.meta.isOpen });

  // Open an editor if the node is opened
  React.useEffect(() => {
    if (isOpen) graphEditor.send({ type: 'editDocument', payload: data.id });
  }, [isOpen]);

  // Save the document if the node is closed
  React.useEffect(() => {
    if (documentEditor) documentEditor.send({ type: 'saveDocument' });
  }, [isOpen]);

  // Update the node if the open status changes
  React.useEffect(() => { isOpen !== !!data.meta.isOpen && graphEditor.send({
    type: 'updateDocument',
    payload: { id, meta: { ...data.meta, isOpen: isOpen } }
  })}, [isOpen]);


  // Track if the node is hovered, to show items like toolbars
  const { isHovered } = useHover({ hoverElementRef: rootRef });

  // If the content container is hovered, intercept any scroll events
  // to cause the content to scroll instead of the graph zooming in/out
  useHover({
    hoverElementRef: contentContainerRef,
    in: () => canElementScroll(contentContainerRef.current!) && contentContainerRef.current?.addEventListener('wheel', stopPropagation),
    out: () => contentContainerRef.current?.removeEventListener('wheel', stopPropagation)
  }, []);


  // If we're editing the node and node loses focus, save the changes
  const { focusElementRef, focusElementProps } = useFocus({
    ref: rootRef,
    out: () => documentEditor?.send({ type: 'saveDocument' })
  });

  // Handle node resizing behavior
  const { resizeHandleRef } = useNodeResizing<HTMLDivElement>({
    resizeElementRef: contentContainerRef,
    stop: ({ x, y, width, height }) => graphEditor.send({ type: 'updateDocument', payload: {
      id, 
      meta: { x, y, width, height }
    }})
  });

  // Connect the title input to the document editor machine
  const handleTitleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    documentEditor?.send({ type: 'editDocument', payload: {
      title: event.target.value
    }});
  }, [documentEditor]);

  // Open the full editor on click
  const [_, setLocation] = useLocation();
  const handleViewAsPage = () => setLocation(createDocumentRoute(data.id));
  
  // Extract display data from the node, or the document editor if it's open
  const { title, contentType } = { ...data, ...documentEditor?.state?.context.document };
  const width = data.meta?.width ? `${data.meta.width}px` : undefined;
  const height = data.meta?.height ? `${data.meta.height}px` : undefined;

  return (
    <Grid
      ref={rootRef}
      bg='white'
      overflow='hidden'
      borderRadius='4'
      borderWidth='2px'
      borderColor={selected ? 'blue.500' : 'gray.400'}
      cursor='default'
      templateRows='auto 1fr'
      templateColumns='auto 1fr auto'
      gridColumnGap='2'
      pr='1'
      boxShadow='xl'
      {...focusElementProps}
    >
      
      <Handle id='top' type='target' position={Position.Top} />
      <Handle id='bottom' type='source' position={Position.Bottom}/>
      
      <Grid 
        id='draghandle'
        p='2'
        bg='blue.500'
        alignItems='center'
        justifyItems='center'
        cursor='grab'
      >
        <Icon as={HiOutlineDocumentText} stroke='white' boxSize={6}/>
      </Grid>

      <Input
        borderColor='transparent'
        alignSelf='center'
        pointerEvents='all'
        size='md'
        fontWeight='bold'
        value={title}
        onChange={handleTitleChange}
        px='1'
        py='0'
        height='1.5em'
      />

      <Fade in={isHovered}>
        <Flex 
          ref={toolbarRef}
          flexDirection='row-reverse'
          alignSelf='center'
        >
          <ButtonGroup size='sm' color='gray.500' isAttached ml='2'>
            <IconButton 
              display={isOpen ? undefined : 'none'}
              aria-label='Open'
              icon={<ExternalLinkIcon color='gray.500'/>}
              size='sm'
              onClick={handleViewAsPage}
            />
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <Icon as={MdOutlineKeyboardArrowUp}/> : <Icon as={MdOutlineKeyboardArrowDown}/>}
              aria-label='More...'
            />
          </ButtonGroup>
        </Flex>
      </Fade>

      <Box 
        id='draghandle' 
        bg='blue.500'
        cursor='grab'
      />

      <Collapse
        unmountOnExit
        in={isOpen}
        style={{ gridColumn: 'span 2', overflow: 'hidden' }}
      >
        <Grid 
          ref={contentContainerRef}
          width={width}
          height={height}
          minW='496px'
          minH='20'
          templateRows='1fr'
          templateColumns='1fr'
          overflow='auto'
        >
          <DocumentEditorProvider editor={documentEditor}>
            <Portal containerRef={toolbarRef}>
              <DocumentEditorToolbar size='sm'/>
            </Portal>
            <ContentEditor maxWidth={width}/>
          </DocumentEditorProvider>
        </Grid>
      </Collapse>

      <ResizeHandle
        ref={resizeHandleRef!}
        position='absolute'
        bottom='-3'
        right='-3'
        pointerEvents='all'
        color='gray.500'
        display={isOpen ? 'block' : 'none'}
      />
    </Grid>
  );
}


function stopPropagation(event: any) {
  event.stopPropagation();
}