import { DocumentGraph, DocumentGraphQuery, DocumentLink, ID, ValidationError } from "@/domain";
import { assign, createMachine } from "xstate";
import { ClientDocumentsGateway } from "../interfaces";



export type GraphModelContext = {
  graph?: DocumentGraph,
  error?: Error
}


export type GraphModelStates = {
  states: {
    idle: {},
    loading: {
      states: {
        getGraph: {},
        addLink: {},
        removeLink: {}
      }
    },
    error: {}
  }
};


export type GetGraphEvent = { type: 'getGraph', payload: DocumentGraphQuery };
export type AddLinkEvent = { type: 'addLink', payload: DocumentLink };
export type RemoveLinkEvent = { type: 'removeLink', payload: Omit<DocumentLink, 'meta'> };

export type GraphModelEvent = GetGraphEvent | AddLinkEvent | RemoveLinkEvent;

export function makeGraphModel(gateway: ClientDocumentsGateway) {
  return createMachine<GraphModelContext, GraphModelEvent>({
    id: 'graph-model',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          getGraph: { target: 'loading.getGraph' },
          addLink: { target: 'loading.addLink' },
          removeLink: { target: 'loading.removeLink' },
        }
      },

      loading: {
        states: {
          getGraph: {
            invoke: {
              src: 'getGraph',
              onDone: { target: '#graph-model.idle', actions: ['assignGraph'] },
              onError: { target: '#graph-model.error', actions: ['assignError'] }
            }
          },

          addLink: {
            invoke: {
              src: 'addLink',
              onDone: { target: '#graph-model.idle', actions: ['assignNewLink'] },
              onError: { target: '#graph-model.error', actions: ['assignError'] }
            }
          },

          removeLink: {
            invoke: {
              src: 'removeLink',
              onDone: { target: '#graph-model.idle', actions: ['assignRemoveLink'] },
              onError: { target: '#graph-model.error', actions: ['assignError'] }
            }
          }
        }
      },
      
      error: {
        on: {
          getGraph: { target: 'loading.getGraph' },
          addLink: { target: 'loading.addLink' },
          removeLink: { target: 'loading.removeLink' }
        }
      }
    }
  }, {
    services: {
      async getGraph(context, event) {
        assertFetchEvent(event);
        const { payload: query } = event;

        return await gateway.graphByQuery(query);
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


function assertFetchEvent(event: GraphModelEvent) : asserts event is GetGraphEvent {
  if (event.type !== 'getGraph')
    throw new ValidationError('Not a fetch event.', ['event', 'type'], 'fetch', event.type);
}

function assertAddLinkEvent(event: GraphModelEvent) : asserts event is AddLinkEvent {
  if (event.type !== 'addLink')
    throw new ValidationError('Wrong event type', ['event', 'type'], 'addLink', event.type);
}

function assertRemoveLinkEvent(event: GraphModelEvent) : asserts event is RemoveLinkEvent {
  if (event.type !== 'removeLink')
    throw new ValidationError('Wrong event type', ['event', 'type'], 'removeLink', event.type);
}