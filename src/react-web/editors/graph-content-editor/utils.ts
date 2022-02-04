import type { DocumentHeader, DocumentLink } from "@/domain";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "react-flow-renderer";

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

export function linkToFlowEdge(link: DocumentLink) : ReactFlowEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    source: link.from,
    target: link.to
  };
}