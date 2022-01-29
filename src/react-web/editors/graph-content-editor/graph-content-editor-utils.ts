import { ValidationError, DocumentHeader, DocumentLink, Document, DocumentGraph } from "@/domain";
import type { GraphContent, GraphNode, GraphEdge, DocumentGraphNode } from "@/content";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode, FlowElement as ReactFlowElement } from "react-flow-renderer";


// Walk up an element's chain up parents until you reach the one that has
// the nodeContainerClass, and return it
const nodeContainerClass = 'react-flow__node';
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


// Create a GraphNode from a Document or DocumentHeader
export function docToGraphNode(doc: DocumentHeader | Document) : DocumentGraphNode {
  const { id } = doc;
  
  return {
    id,
    type: 'document',
    documentId: id,
  };
}


// Create a GraphEdge from a DocumentLink
export function linkToGraphEdge(link: DocumentLink) : GraphEdge {
  const { from, to } = link;
  
  return {
    id: `${from}:${to}`,
    sourceId: from,
    targetId: to,
  };
}


// Create a GraphContent from a DocumentGraph
export function documentGraphToGraphContent(documentGraph: DocumentGraph) : GraphContent {
  return {
    nodes: documentGraph.documents.map(docToGraphNode),
    edges: documentGraph.links.map(linkToGraphEdge)
  };
}


// Convert a GraphNode to a ReactFlowNode
export function graphNodeToFlowNode(node: GraphNode) : ReactFlowNode<GraphNode> {
  const { id, type, x = 0, y = 0 } = node;

  return {
    id,
    type,
    data: node,
    position: { x, y },
    dragHandle: '#draghandle',
  };
}

// Convert a GraphEdge to a ReactFlowEdge
export function graphEdgeToFlowEdge(edge: GraphEdge) : ReactFlowEdge<GraphEdge> {
  const { id, sourceId, targetId } = edge;

  return {
    id,
    data: edge,
    source: sourceId,
    target: targetId,
  };
}

// Convert GraphContent to a list of ReactFlowElements
export function graphContentToFlowElements(content: GraphContent) : ReactFlowElement[] {
  return [
    ...content.nodes.map(graphNodeToFlowNode),
    ...content.edges.map(graphEdgeToFlowEdge)
  ];
}


// Convert a DocumentGraph into ReactFlowElements
export function documentGraphToFlowElements(documentGraph: DocumentGraph) : ReactFlowElement[] {
  const graphContent = documentGraphToGraphContent(documentGraph);
  return graphContentToFlowElements(graphContent);
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
    edges: [...content.edges, edge]
  };
}

// Add a node to some GraphContent
export function addNode(content: GraphContent, node: GraphNode) : GraphContent {
  const alreadyInGraph = content.nodes.some(n => n.id === node.id)
  if (alreadyInGraph)
    return content;

  return {
    ...content,
    nodes: [...content.nodes, node]
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