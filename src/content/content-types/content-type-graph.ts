import { parseContentType } from "@/content/utils";
import { ID, Document, DocumentHeader } from "@/domain";


export type DefaultGraphNode = {
  id: ID,
  type: string,
  x?: number,
  y?: number,
}

export type DocumentGraphNode = DefaultGraphNode & {
  type: 'document',
  documentId?: ID,
  width?: number,
  height?: number,
  isOpen?: boolean,
  scrollTop?: number,
  scrollLeft?: number,
}

export type GraphNode = 
  | DefaultGraphNode
  | DocumentGraphNode;

export type GraphEdge = {
  id: ID,
  sourceId: ID,
  targetId: ID,
}

export type GraphContent = {
  nodes: GraphNode[],
  edges: GraphEdge[],
  viewport?: GraphViewport,
}

export type GraphViewport = {
  zoom?: number,
  panX?: number,
  panY?: number,
}

export const graphContentType = Object.freeze({ ...parseContentType('ocean/graph'), name: 'Ocean Graph' });
