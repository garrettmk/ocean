import { DocumentGraph, ID } from "@/domain";
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


export type DocumentGraphodelEvent =
  { type: 'fetch', payload: ID };


export function makeDocumentGraphodel(gateway: ClientDocumentsGateway) {
  return createMachine<DocumentGraphodelContext, DocumentGraphodelEvent>({
    id: 'document-graph',
    initial: 'loading',
    context: {},
    states: {
      idle: {
        on: {
          fetch: { target: 'loading' }
        }
      },

      loading: {
        invoke: {
          src: 'getDocumentGraph',
          onDone: { target: 'idle', actions: ['assignGraph'] },
          onError: { target: 'error', actions: ['assignError'] }
        }
      },
      
      error: {
        on: {
          fetch: { target: 'loading' }
        }
      }
    }
  }, {
    services: {
      async getDocumentGraph(context, event) {
        const id = event.payload;

        return await gateway.getDocumentGraph(id);
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
      })
    }
  })
}