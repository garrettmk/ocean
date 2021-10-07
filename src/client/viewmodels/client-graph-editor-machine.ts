import { DocumentGraph, DocumentGraphQuery, DocumentLink, ID } from "@/domain";
import { createMachine, assign, DoneInvokeEvent, ErrorPlatformEvent } from "xstate";
import { ClientDocumentsGateway } from "../interfaces";



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
    value: 'linkingDocuments' | 'unlinkingDocuments',
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


export type LoadGraphEvent = { type: 'loadGraph', payload: DocumentGraphQuery };
export type LinkDocumentsEvent = { type: 'linkDocuments' };
export type UnlinkDocumentsEvent = { type: 'unlinkDocuments' };
export type DeleteDocumentEvent = { type: 'deleteDocument' };
export type SelectDocumentEvent = { type: 'selectDocument', payload: ID };
export type CancelEvent = { type: 'cancel' };

export type GraphEditorEvent = 
  | LoadGraphEvent
  | LinkDocumentsEvent
  | UnlinkDocumentsEvent
  | DeleteDocumentEvent
  | SelectDocumentEvent
  | CancelEvent;

export type DocumentGraphMachine = ReturnType<typeof makeGraphEditorMachine>;

export function makeGraphEditorMachine(gateway: ClientDocumentsGateway) {
  return createMachine<GraphEditorContext, GraphEditorEvent, GraphEditorTypeState>({
    id: 'graph-editor',
    context: { selectedDocuments: [] },
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
          loadGraph: { target: 'loading' },
          linkDocuments: { target: 'linkingDocuments' },
          unlinkDocuments: { target: 'unlinkingDocuments' },
        }
      },

      linkingDocuments: {
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
      }
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
      }
    },


    actions: {
      assignGraph: assign({
        graph: (context, event) => (event as DoneInvokeEvent<DocumentGraph>).data
      }),

      assignError: assign({
        error: (context, event) => (event as ErrorPlatformEvent).data
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
    }
  });
}