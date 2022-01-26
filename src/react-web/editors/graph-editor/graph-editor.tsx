import { GraphContent, GraphEdge, GraphNode, GraphViewport } from "@/content";
import { ValidationError } from "@/domain";
import { ContentEditorProps } from "@/react-web/components/content-editor";
import { useDocumentEditor } from "@/react-web/hooks";
import { Grid } from "@chakra-ui/react";
import React from 'react';
import ReactFlow, { 
  Connection, 
  Edge as ReactFlowEdge, 
  FlowElement, 
  FlowTransform, 
  Node as ReactFlowNode, 
  OnLoadFunc, 
  ReactFlowProvider 
} from "react-flow-renderer";
import { graphContentToFlowElements, addEdge, replaceNode } from "./graph-editor-utils";


export function GraphEditor({
  toolbarRef,
  toolbarSize,
  ...boxProps
}: ContentEditorProps) {
  const documentEditor = useDocumentEditor();
  const content = documentEditor?.state.context.document?.content as GraphContent;
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

    documentEditor?.send({
      type: 'editDocument',
      payload: {
        contentType: 'ocean/graph',
        content: addEdge(content, edge)
      }
    });
  }, [documentEditor, content]);

  // Update the graph when the user drags a node to a new position
  const handleNodeDragStop = React.useCallback((event: React.MouseEvent, node: ReactFlowNode<GraphNode>) => {
    const { id, data: graphNode } = node;
    const { x, y } = node.position;

    const newGraphNode: GraphNode = {
      ...graphNode!,
      x: x,
      y: y
    };

    documentEditor?.send({
      type: 'editDocument',
      payload: {
        contentType: 'ocean/graph',
        content: replaceNode(content!, newGraphNode)
      }
    });
  }, [documentEditor, content]);


  // Update the graph when the user pans or zooms
  const handleMoveEnd = React.useCallback((tx?: FlowTransform) => {
    if (!tx) return;
    
    const newViewport: GraphViewport = {
      zoom: tx.zoom,
      panX: tx.x,
      panY: tx.y
    };

    documentEditor?.send({
      type: 'editDocument',
      payload: {
        contentType: 'ocean/graph',
        content: {
          ...content!,
          viewport: newViewport
        }
      }
    });
  }, [documentEditor, content]);
  
  return (
    <Grid templateRows='1fr' templateColumns='1fr' {...boxProps}>
      <ReactFlowProvider>
        <ReactFlow
          snapToGrid
          elements={elements}
          onLoad={handleLoad}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
          onMoveEnd={handleMoveEnd}
        />
      </ReactFlowProvider>
    </Grid>
  );
}