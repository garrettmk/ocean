import { DocumentHeader, DocumentLink } from '@/domain';
import ELK, { ElkEdge, ElkNode } from 'elkjs/lib/elk-api';


export interface ElkNodeWithData extends ElkNode {
  data: DocumentHeader
}

export interface ElkEdgeWithData extends ElkEdge {
  data: DocumentLink
}


export function makeELK() {
  return new ELK({
    workerFactory: () => new Worker(new URL('elkjs/lib/elk-worker.js', import.meta.url))
  });
}

export function docToElkNode(doc: DocumentHeader) : ElkNodeWithData {
  return {
    data: doc,
    id: doc.id,
    x: doc.meta?.x ?? 0,
    y: doc.meta?.y ?? 0,
    width: doc.meta?.width ?? 250,
    height: doc.meta?.height ?? 100,
  };
}

export function elkNodeToDoc(node: ElkNode) : DocumentHeader {
  const { x, y, width, height, data } = node as Required<ElkNodeWithData>;

  return {
    ...data,
    meta: {
      ...data.meta,
      x, y, width, height,
    }
  };
}

export function linkToElkEdge(link: DocumentLink) : ElkEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    sources: [link.from],
    targets: [link.to],
  };
}

export function elkEdgeToLink(edge: ElkEdge) : DocumentLink {
  const { data } = edge as ElkEdgeWithData;
  return {
    ...data,
  };
}