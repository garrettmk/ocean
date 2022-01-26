import { IDSchema, validate } from '@/domain'
import { type, literal, string, number, boolean, object, optional, array, assign, union, } from 'superstruct';
import type { GraphContent, GraphNode, DefaultGraphNode, DocumentGraphNode, GraphEdge, GraphViewport } from '@/content/content-types';

const DefaultGraphNodeSchema = type({
  id: IDSchema,
  type: string(),
  x: optional(number()),
  y: optional(number()),
});

export function validateDefaultGraphNode(value: any) : asserts value is DefaultGraphNode {
  validate(value, DefaultGraphNodeSchema);
}


const DocumentGraphNodeSchema = assign(DefaultGraphNodeSchema, object({
  type: literal('document'),
  documentId: optional(IDSchema),
  width: optional(number()),
  height: optional(number()),
  isOpen: optional(boolean()),
  scrollTop: optional(number()),
  scrollLeft: optional(number())
}));

export function validateDocumentGraphNode(value: any) : asserts value is DocumentGraphNode {
  validate(value, DocumentGraphNodeSchema);
}


const GraphNodeSchema = union([
  DefaultGraphNodeSchema,
  DocumentGraphNodeSchema,
]);

export function validateGraphNode(value: any) : asserts value is GraphNode {
  validate(value, GraphNodeSchema);
}


const GraphEdgeSchema = object({
  id: IDSchema,
  sourceId: IDSchema,
  targetId: IDSchema,
});

export function validateGraphEdge(value: any) : asserts value is GraphEdge {
  validate(value, GraphEdgeSchema);
}


const GraphViewportSchema = object({
  zoom: optional(number()),
  panX: optional(number()),
  panY: optional(number()),
});

export function validateViewportSchema(value: any) : asserts value is GraphViewport {
  validate(value, GraphViewportSchema);
}


const GraphContentSchema = object({
  nodes: array(DefaultGraphNodeSchema),
  edges: array(GraphEdgeSchema),
  viewport: optional(GraphViewportSchema),
});

export function validateGraphContent(value: any) : asserts value is GraphContent {
  validate(value, GraphContentSchema);
}