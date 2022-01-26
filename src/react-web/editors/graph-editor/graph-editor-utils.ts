import { ValidationError, DocumentHeader, DocumentLink } from "@/domain";
import type { GraphContent, GraphNode, GraphEdge, DocumentGraphNode } from "@/content";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode, FlowElement as ReactFlowElement } from "react-flow-renderer";

const nodeContainerClass = 'react-flow__node';

// Walk up an element's chain up parents until you reach the one that has
// the nodeContainerClass, and return it
export function getNodeContainerElement(el: HTMLElement) {
  // Start with the given element
  let element: HTMLElement | null = el;
  while (element) {
    // If this is the node container, return it
    if (element.classList.contains(nodeContainerClass))
      return element;
    
    // Otherwise go up a level
    element = element.parentElement;
  }

  // Nothing found
  return null;
}

// Create a ReactFlowNode from a DocumentHeader
export function docToFlowNode(doc: DocumentHeader) : ReactFlowNode {
  return {
    // @ts-ignore
    data: doc,
    id: doc.id,
    dragHandle: '#draghandle',
    position: {
      x: doc.meta.x ?? 0,
      y: doc.meta.y ?? 0,
    },
  };
}

// Create a ReactFlowEdge from a DocumentLink
export function linkToFlowEdge(link: DocumentLink) : ReactFlowEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    source: link.from,
    target: link.to
  };
}


// Create a GraphNode from a DocumentHeader
export function docToGraphNode(doc: DocumentHeader) : DocumentGraphNode {
  const { id } = doc;
  
  return {
    id,
    type: 'document',
    documentId: id,
  };
}


// Create a GraphEdge from a DocumentLink
export function linkToGraphEdge(link: DocumentLink) : GraphEdge {
  const { from, to, meta } = link;
  
  return {
    id: `${from}:${to}`,
    sourceId: from,
    targetId: to
  };
}

// Convert a GraphNode to a ReactFlowNode
export function graphNodeToFlowNode(node: GraphNode) : ReactFlowNode<GraphNode> {
  const { id, type, x = 0, y = 0 } = node;

  return {
    id,
    type,
    position: { x, y },
    data: node
  };
}

// Convert a GraphEdge to a ReactFlowEdge
export function graphEdgeToFlowEdge(edge: GraphEdge) : ReactFlowEdge<GraphEdge> {
  const { id, sourceId, targetId } = edge;

  return {
    id,
    source: sourceId,
    target: targetId,
    data: edge
  };
}

// Convert GraphContent to a list of ReactFlowElements
export function graphContentToFlowElements(content: GraphContent) : ReactFlowElement[] {
  return [
    ...content.nodes.map(graphNodeToFlowNode),
    ...content.edges.map(graphEdgeToFlowEdge)
  ];
}

// Add an edge to some GraphContent
export function addEdge(content: GraphContent, edge: GraphEdge) : GraphContent {
  const existingEdge = content.edges.find(e => e.sourceId === edge.sourceId && e.targetId === edge.targetId);
  if (existingEdge) return content;

  const sourceExists = content.nodes.some(node => node.id === edge.sourceId);
  const targetExists = content.nodes.some(node => node.id === edge.targetId);

  if (!sourceExists)
    throw new ValidationError(`Source node not found in graph: ${edge.sourceId}`, ['sourceId'], 'an ID that exists in the graph', edge.sourceId);
  if (!targetExists)
    throw new ValidationError(`Target node not found in graph: ${edge.targetId}`, ['targetId'], 'an ID that exists in the graph', edge.targetId);

  return {
    ...content,
    edges: content.edges.concat([edge])
  };
}

// Replace a node in some GraphContent
export function replaceNode(content: GraphContent, node: GraphNode) : GraphContent {
  const index = content.nodes.findIndex(n => n.id === node.id);
  if (index > -1) {
    const nodesBefore = content.nodes.slice(0, index);
    const nodesAfter = content.nodes.slice(index + 1);
  
    return {
      ...content,
      nodes: [...nodesBefore, node, ...nodesAfter]
    };
  } else {
    return {
      ...content,
      nodes: [...content.nodes, node]
    };
  }
}