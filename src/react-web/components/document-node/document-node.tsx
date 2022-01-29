import { DocumentGraphNode } from '@/content';
import { ResizeHandle } from '@/react-web/components';
import { createDocumentRoute } from '@/react-web/config/routes';
import { useGraphContentEditor } from '@/react-web/hooks';
import { useDocumentEditorMachine2, useFocus, useHover, useNodeResizing } from '@/react-web/hooks';
import { canElementScroll } from '@/react-web/utils';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, ButtonGroup, Collapse, Fade, Flex, Grid, Icon, IconButton, Input, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { useLocation } from 'wouter';


export function DocumentNode({
  id,
  data,
  type,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<DocumentGraphNode>) {
  const graphEditor = useGraphContentEditor();

  // Keep a ref to the root element, and to the toolbar element
  // also the content container
  const rootRef = React.useRef<HTMLDivElement>(null);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  const { documentEditor, startDocumentEditor } = useDocumentEditorMachine2({
    documentId: data.documentId
  });

  // Start the document editor if the node is opened, and save if it's closed
  const { isOpen, onToggle } = useDisclosure({ 
    defaultIsOpen: data.isOpen,
    onOpen: startDocumentEditor,
    onClose: () => documentEditor?.send({ type: 'saveDocument' })
  });

  // Start the editor if the title input gets focus
  // If the node as a whole loses focus, save the document
  const { focusElementRef, focusElementProps } = useFocus({
    ref: rootRef,
    in: () => titleInputRef.current === document.activeElement && startDocumentEditor(),
    out: () => documentEditor?.send({ type: 'saveDocument' })
  });

  // Update the node if the open status changes
  React.useEffect(() => { isOpen !== !!data.isOpen && graphEditor?.updateNode({
    id, type: 'document', isOpen
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

  // Handle node resizing behavior
  const { resizeHandleRef } = useNodeResizing<HTMLDivElement>({
    resizeElementRef: contentContainerRef,
    stop: ({ x, y, width, height }) => graphEditor?.updateNode({
      id, type: 'document', x, y, width, height
    })
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
  const doc = documentEditor?.state.context.document;
  const title = doc?.title ?? '';
  const width = data.width ? `${data.width}px` : undefined;
  const height = data.height ? `${data.height}px` : undefined;

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
        ref={titleInputRef}
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
          {/* <DocumentEditorProvider editor={documentEditor}>
            <Portal containerRef={toolbarRef}>
              <DocumentEditorToolbar size='sm'/>
            </Portal>
            <ContentEditor maxWidth={width}/>
          </DocumentEditorProvider> */}
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