import { Document, DocumentHeader, DocumentGraph, DocumentGraphQuery, DocumentLink, ID } from "@/domain";
import { CreateDocumentInput } from "@/server/usecases";
import { createMachine, assign, DoneInvokeEvent, ErrorPlatformEvent, State } from "xstate";
import { ClientDocumentsGateway } from "../interfaces";
import { assertEventType } from "../utils";
import ELK, { ElkEdge, ElkNode } from 'elkjs';
const elk = new ELK();


interface ElkNodeWithData extends ElkNode {
  data: DocumentHeader
}

interface ElkEdgeWithData extends ElkEdge {
  data: DocumentLink
}

function docToElkNode(doc: DocumentHeader) : ElkNodeWithData {
  return {
    data: doc,
    id: doc.id,
    x: doc.meta?.layout?.x ?? 0,
    y: doc.meta?.layout?.y ?? 0,
    width: doc.meta?.layout?.width ?? 250,
    height: doc.meta?.layout?.height ?? 100,
  };
}

function elkNodeToDoc(node: ElkNode) : DocumentHeader {
  const { x, y, width, height, data } = node as Required<ElkNodeWithData>;

  return {
    ...data,
    meta: {
      ...data.meta,
      layout: { x, y, width, height }
    }
  };
}

function linkToElkEdge(link: DocumentLink) : ElkEdge {
  return {
    // @ts-ignore
    data: link,
    id: `${link.from}:${link.to}`,
    sources: [link.from],
    targets: [link.to],
  };
}

function elkEdgeToLink(edge: ElkEdge) : DocumentLink {
  const { data } = edge as ElkEdgeWithData;
  return {
    ...data,
  };
}

export type GraphEditorContext = {
  graph?: DocumentGraph,
  error?: Error,
  selectedDocuments: ID[],
};

export type GraphEditorTypeState =
  | {
    value: 'idle' | 'loading',
    context: {
      graph: undefined,
      error: undefined,
      selectedDocuments: []
    }
  }
  | {
    value: 'ready',
    context: {
      graph: DocumentGraph,
      error: undefined,
      selectedDocuments: []
    }
  }
  | {
    value: 'linkingDocuments' | 'unlinkingDocuments' | 'importingUrl' | 'creatingDocument' | 'updatingLayout' | 'layingOutGraph',
    context: {
      graph: DocumentGraph,
      error?: Error,
      selectedDocuments: []
    }
  }
  | {
    value: 
      | { linkingDocuments: 'selectingFromDocument' }
      | { unlinkingDocuments: 'selectingFromDocument' },
    context: {
      graph: DocumentGraph,
      error?: Error,
      selectedDocuments: []
    }
  }
  | {
    value: 
      | { linkingDocuments: 'selectingToDocument' }
      | { unlinkingDocuments: 'selectingToDocument' },
    context: {
      graph: DocumentGraph,
      error?: Error,
      selectedDocuments: [ID]
    }
  }
  | {
    value: 
      | { linkingDocuments: 'linking' }
      | { unlinkingDocuments: 'unlinking' }
    context: {
      graph: DocumentGraph,
      error?: Error,
      selectedDocuments: [ID, ID]
    }
  }


export type UpdateLayoutInput = {
  id: ID,
  x: number,
  y: number,
  width: number,
  height: number
}

export type LoadGraphEvent = { type: 'loadGraph', payload: DocumentGraphQuery };
export type LinkDocumentsEvent = { type: 'linkDocuments', payload?: Partial<DocumentLink> };
export type UnlinkDocumentsEvent = { type: 'unlinkDocuments' };
export type DeleteDocumentEvent = { type: 'deleteDocument' };
export type SelectDocumentEvent = { type: 'selectDocument', payload: ID };
export type ImportUrlEvent = { type: 'importUrl', payload: string };
export type CreateDocumentEvent = { type: 'createDocument', payload: CreateDocumentInput };
export type UpdateLayoutEvent = { type: 'updateLayout', payload: UpdateLayoutInput };
export type LayoutGraphEvent = { type: 'layoutGraph' };
export type CancelEvent = { type: 'cancel' };

export type GraphEditorEvent = 
  | LoadGraphEvent
  | LinkDocumentsEvent
  | UnlinkDocumentsEvent
  | DeleteDocumentEvent
  | SelectDocumentEvent
  | ImportUrlEvent
  | CreateDocumentEvent
  | UpdateLayoutEvent
  | LayoutGraphEvent
  | CancelEvent;

export type GraphEditorMachine = ReturnType<typeof makeGraphEditorMachine>;
export type GraphEditorMachineState = State<GraphEditorContext, GraphEditorEvent, GraphEditorTypeState>;

const defaultInitialContext: GraphEditorContext = {
  selectedDocuments: []
}

export function makeGraphEditorMachine(
  gateway: ClientDocumentsGateway, 
  initialContext: GraphEditorContext = defaultInitialContext
) {
  return createMachine<GraphEditorContext, GraphEditorEvent, GraphEditorTypeState>({
    id: 'graph-editor',
    context: initialContext,
    initial: 'idle',
    states: {
      idle: {
        on: {
          loadGraph: { target: 'loading' }
        }
      },

      loading: {
        invoke: {
          src: 'loadGraph',
          onDone: { target: 'ready', actions: ['assignGraph'] },
          onError: { target: 'idle', actions: ['assignError'] }
        }
      },

      ready: {
        on: {
          selectDocument: { actions: ['assignSelectDocument'] },
          loadGraph: { target: 'loading' },
          linkDocuments: { target: 'linkingDocuments' },
          unlinkDocuments: { target: 'unlinkingDocuments' },
          importUrl: { target: 'importingUrl' },
          createDocument: { target: 'creatingDocument' },
          updateLayout: { target: 'updatingLayout' },
          layoutGraph: { target: 'layingOutGraph' },
        }
      },

      linkingDocuments: {
        entry: ['assignFromLinkDocumentsEvent'],
        initial: 'selectingFromDocument',
        states: {
          selectingFromDocument: {
            always: [
              { cond: 'hasToAndFrom', target: 'linking' },
              { cond: 'hasFrom', target: 'selectingToDocument' }
            ],
            on: {
              selectDocument: { target: 'selectingToDocument', actions: ['assignFromDocument'] },
              cancel: { target: '#graph-editor.ready', actions: ['assignClearSelection'] }
            }
          },
          selectingToDocument: {
            on: {
              selectDocument: { target: 'linking', actions: ['assignToDocument'] },
              cancel: { target: '#graph-editor.ready', actions: ['assignClearSelection'] }
            }
          },
          linking: {
            invoke: {
              src: 'linkDocuments',
              onDone: { target: '#graph-editor.ready', actions: ['assignNewLink', 'assignClearSelection'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      unlinkingDocuments: {
        initial: 'selectingFromDocument',
        states: {
          selectingFromDocument: {
            on: {
              selectDocument: { target: 'selectingToDocument', actions: ['assignFromDocument'] },
              cancel: { target: '#graph-editor.ready', actions: ['assignClearSelection'] }
            }
          },
          selectingToDocument: {
            on: {
              selectDocument: { target: 'unlinking', actions: ['assignToDocument'] },
              cancel: { target: '#graph-editor.ready', actions: ['assignClearSelection'] }
            }
          },
          unlinking: {
            invoke: {
              src: 'unlinkDocuments',
              onDone: { target: '#graph-editor.ready', actions: ['assignRemoveLink', 'assignClearSelection'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      importingUrl: {
        initial: 'importing',
        states: {
          importing: {
            invoke: {
              src: 'importUrl',
              onDone: { target: '#graph-editor.ready', actions: ['assignNewDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] },
            }
          }
        }
      },

      creatingDocument: {
        initial: 'creating',
        states: {
          creating: {
            invoke: {
              src: 'createDocument',
              onDone: { target: '#graph-editor.ready', actions: ['assignNewDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      updatingLayout: {
        initial: 'updating',
        states: {
          updating: {
            invoke: {
              src: 'updateLayout',
              onDone: { target: '#graph-editor.ready', actions: ['assignUpdatedLayout'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      layingOutGraph: {
        initial: 'working',
        states: {
          working: {
            invoke: {
              src: 'layoutGraph',
              onDone: { target: '#graph-editor.ready', actions: ['assignGraph'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },
    }
  }, {
    services: {
      async loadGraph(context, event) {
        const query = (event as LoadGraphEvent).payload;

        return await gateway.graphByQuery(query);
      },

      async linkDocuments(context, event) {
        const { selectedDocuments } = context;
        const [from, to] = selectedDocuments;
        const meta = {};

        return await gateway.linkDocuments(from, to, meta);
      },

      async unlinkDocuments(context, event) {
        const { selectedDocuments } = context;
        const [from, to] = selectedDocuments;
        
        return await gateway.unlinkDocuments(from ,to);
      },

      async importUrl(context, event) {
        assertEventType<ImportUrlEvent>(event, 'importUrl');
        const url = event.payload;

        return await gateway.importDocumentFromUrl(url);
      },

      async createDocument(context, event) {
        assertEventType<CreateDocumentEvent>(event, 'createDocument');
        const input = event.payload;
        return await gateway.createDocument(input);
      },

      async updateLayout(context, event) {
        assertEventType<UpdateLayoutEvent>(event, 'updateLayout');
        const { id, ...layout } = event.payload;

        return await gateway.updateDocument(id, { 
          // @ts-ignore
          meta: { layout } 
        });
      },

      async layoutGraph(context, event) {
        assertEventType<LayoutGraphEvent>(event, 'layoutGraph');
        
        // Describe the graph in ELK JSON format and tell elk to lay it out
        const layout = await elk.layout({
          id: 'root',
          layoutOptions: { 'algorithm': 'layered', 'elk.direction': 'DOWN' },
          children: (context.graph?.documents ?? []).map(docToElkNode),
          edges: (context.graph?.links ?? []).map(linkToElkEdge)
        });

        // Transform the elk layout back into docs/links
        const newGraph: DocumentGraph = {
          documents: layout.children!.map(elkNodeToDoc),
          links: layout.edges!.map(elkEdgeToLink),
        };

        return newGraph;
      }
    },


    actions: {
      assignGraph: assign({
        graph: (context, event) => (event as DoneInvokeEvent<DocumentGraph>).data
      }),

      assignError: assign({
        error: (context, event) => (event as ErrorPlatformEvent).data
      }),

      assignSelectDocument: assign({
        selectedDocuments: (context, event) => [(event as SelectDocumentEvent).payload],
      }),

      assignFromLinkDocumentsEvent: assign({
        selectedDocuments: (context, event) => {
          const { from , to } = (event as LinkDocumentsEvent).payload ?? {};
          return (
            from && to ? [from, to] :
            from ? [from] :
            []
          );
        }
      }),

      assignFromDocument: assign({
        selectedDocuments: (context, event) => [(event as SelectDocumentEvent).payload],
      }),

      assignToDocument: assign({
        selectedDocuments: (context, event) => [context.selectedDocuments[0], (event as SelectDocumentEvent).payload],
      }),

      assignNewLink: assign({
        graph: (context, event) => ({
          documents: context.graph!.documents,
          links: [...context.graph!.links, (event as DoneInvokeEvent<DocumentLink>).data]
        })
      }),

      assignRemoveLink: assign({
        graph: (context, event) => ({
          documents: context.graph!.documents,
          links: context.graph!.links.filter(link => 
            link.from !== (event as DoneInvokeEvent<DocumentLink>).data.from && 
            link.to !== (event as DoneInvokeEvent<DocumentLink>).data.to
          )
        })
      }),

      assignClearSelection: assign({
        selectedDocuments: (context, event) => []
      }),

      assignNewDocument: assign({
        graph: (context, event) => {
          // TODO: how to assert multiple event types
          // assertEventType<DoneInvokeEvent<Document>>(event, 'done.invoke.importUrl');
          // @ts-ignore
          const { content, ...header } = event.data;

          return {
            documents: [...context.graph!.documents, header],
            links: context.graph!.links
          };
        },
      }),

      assignUpdatedLayout: assign({
        graph: (context, event) => {
          //@ts-ignore
          const { content, ...header } = event.data;

          return {
            documents: context.graph!.documents.filter(doc => doc.id !== header.id).concat([header]),
            links: context.graph!.links
          };
        }
      })
    },

    guards: {
      hasFrom: (context, event) => {
        return context.selectedDocuments.length === 1;
      },

      hasToAndFrom: (context, event) => {
        return context.selectedDocuments.length === 2;
      }
    }
  });
}