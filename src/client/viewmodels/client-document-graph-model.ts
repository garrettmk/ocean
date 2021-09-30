import { DocumentGraph, DocumentLink, ID, ValidationError } from "@/domain";
import { assign, createMachine } from "xstate";
import { ClientDocumentsGateway } from "../interfaces";



export type DocumentGraphodelContext = {
  graph?: DocumentGraph,
  error?: Error
}


export type DocumentGraphodelStates = {
  states: {
    idle: {},
    loading: {},
    error: {}
  }
};


export type GetDocumentGraphEvent = { type: 'getDocumentGraph', payload: ID };
export type AddDocumentLinkEvent = { type: 'addLink', payload: DocumentLink };
export type RemoveLinkEvent = { type: 'removeLink', payload: Omit<DocumentLink, 'meta'> };

export type DocumentGraphModelEvent = GetDocumentGraphEvent | AddDocumentLinkEvent | RemoveLinkEvent;

export function makeDocumentGraphModel(gateway: ClientDocumentsGateway) {
  return createMachine<DocumentGraphodelContext, DocumentGraphModelEvent>({
    id: 'document-graph',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          getDocumentGraph: { target: 'loading.documentGraph' },
          addLink: { target: 'loading.addLink' },
          removeLink: { target: 'loading.removeLink' },
        }
      },

      loading: {
        states: {
          documentGraph: {
            invoke: {
              src: 'getDocumentGraph',
              onDone: { target: '#document-graph.idle', actions: ['assignGraph'] },
              onError: { target: '#document-graph.error', actions: ['assignError'] }
            }
          },

          addLink: {
            invoke: {
              src: 'addLink',
              onDone: { target: '#document-graph.idle', actions: ['assignNewLink'] },
              onError: { target: '#document-graph.error', actions: ['assignError'] }
            }
          },

          removeLink: {
            invoke: {
              src: 'removeLink',
              onDone: { target: '#document-graph.idle', actions: ['assignRemoveLink'] },
              onError: { target: '#document-graph.error', actions: ['assignError'] }
            }
          }
        }
      },
      
      error: {
        on: {
          getDocumentGraph: { target: 'loading.documentGraph' },
          addLink: { target: 'loading.addLink' },
          removeLink: { target: 'loading.removeLink' }
        }
      }
    }
  }, {
    services: {
      async getDocumentGraph(context, event) {
        assertFetchEvent(event);
        const id = event.payload;

        return await gateway.getDocumentGraph(id);
      },

      async addLink(context, event) {
        assertAddLinkEvent(event);
        const { from, to, meta } = event.payload;

        return await gateway.linkDocuments(from, to, meta);
      },

      async removeLink(context, event) {
        assertRemoveLinkEvent(event);
        const { from, to } = event.payload;

        return await gateway.unlinkDocuments(from, to);
      },
    },

    actions: {
      assignGraph: assign({
        // @ts-ignore
        graph: (context, event) => event.data,
      }),

      assignError: assign({
        // @ts-ignore
        error: (context, event) => event.error
      }),

      assignNewLink: assign({

      }),

      assignRemoveLink: assign({

      }),
    }
  })
}


function assertFetchEvent(event: DocumentGraphModelEvent) : asserts event is GetDocumentGraphEvent {
  if (event.type !== 'getDocumentGraph')
    throw new ValidationError('Not a fetch event.', ['event', 'type'], 'fetch', event.type);
}

function assertAddLinkEvent(event: DocumentGraphModelEvent) : asserts event is AddDocumentLinkEvent {
  if (event.type !== 'addLink')
    throw new ValidationError('Wrong event type', ['event', 'type'], 'addLink', event.type);
}

function assertRemoveLinkEvent(event: DocumentGraphModelEvent) : asserts event is RemoveLinkEvent {
  if (event.type !== 'removeLink')
    throw new ValidationError('Wrong event type', ['event', 'type'], 'removeLink', event.type);
}