import { GraphContent, GraphEdge, GraphNode, GraphViewport } from "@/content";
import { DocumentNode } from "@/react-web/components";
import { BoxProps, Grid } from "@chakra-ui/react";
import React from 'react';
import ReactFlow, {
  Connection,
  Edge as ReactFlowEdge, FlowTransform,
  Node as ReactFlowNode,
  OnLoadFunc,
  ReactFlowProvider
} from "react-flow-renderer";
import { GraphContentEditorProvider } from "./graph-content-editor-provider";
import { addEdge, graphContentToFlowElements, replaceNode } from "./graph-content-editor-utils";


export type GraphContentEditorProps = BoxProps & {
  content?: GraphContent,
  onChangeContent?: (newContent: GraphContent) => void,
}

const nodeTypes = { default: DocumentNode };

export function GraphContentEditor({
  content,
  onChangeContent,
  ...boxProps
}: GraphContentEditorProps) {
  const flowInstanceRef = React.useRef<any>();

  // Translate the content into ReactFlow elements
  const elements = React.useMemo(() => content 
    ? graphContentToFlowElements(content) 
    : []
  , [content]);

  // Keep a reference to the ReactFlow instance
  const handleLoad = React.useCallback<OnLoadFunc>(instance => {
    flowInstanceRef.current = instance;
  }, []);

  // Update the graph when the user drags a link between nodes
  const handleConnect = React.useCallback(({ source, target }: ReactFlowEdge<GraphEdge> | Connection) => {
    if (!source || !target || !content)
      return;

    const edge: GraphEdge = {
      id: `${source}:${target}`,
      sourceId: source,
      targetId: target,
    }

    onChangeContent?.(addEdge(content, edge));
  }, [content, onChangeContent]);

  // Update the graph when the user drags a node to a new position
  const handleNodeDragStop = React.useCallback((event: React.MouseEvent, node: ReactFlowNode<GraphNode>) => {
    const { id, data: graphNode } = node;
    const { x, y } = node.position;

    const newGraphNode: GraphNode = {
      ...graphNode!,
      x: x,
      y: y
    };

    onChangeContent?.(replaceNode(content!, newGraphNode));
  }, [content, onChangeContent]);


  // Update the graph when the user pans or zooms
  const handleMoveEnd = React.useCallback((tx?: FlowTransform) => {
    if (!tx) return;
    
    const newViewport: GraphViewport = {
      zoom: tx.zoom,
      panX: tx.x,
      panY: tx.y
    };

    onChangeContent?.({
      ...content!,
      viewport: newViewport
    });
  }, [content, onChangeContent]);


  // Callbacks used by nodes
  const updateNode = React.useCallback((node: GraphNode) => {
    onChangeContent?.(replaceNode(content!, node));
  }, [content]);
  
  return (
    <Grid templateRows='1fr' templateColumns='1fr' {...boxProps}>
      <GraphContentEditorProvider updateNode={updateNode}>
        <ReactFlowProvider>
          <ReactFlow
            snapToGrid
            nodeTypes={nodeTypes}
            elements={elements}
            onLoad={handleLoad}
            onConnect={handleConnect}
            onNodeDragStop={handleNodeDragStop}
            onMoveEnd={handleMoveEnd}
          />
        </ReactFlowProvider>
      </GraphContentEditorProvider>
    </Grid>
  );
}