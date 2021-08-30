import { DocumentHeader } from '@/domain';
import { ClientDocumentsGateway } from '@/client/interfaces';
import { createMachine, assign, ErrorPlatformEvent } from 'xstate';


export type BrowseDocumentsContext = {
  documents: DocumentHeader[],
  error?: Error
}


export type BrowseDocumentsStates = {
  states: {
    loading: {},
    fulfilled: {},
    error: {}
  }
}


export type BrowseDocumentsEvent =
  { type: 'query' };


export function makeBrowseDocumentsMachine(gateway: ClientDocumentsGateway) {
  return createMachine<BrowseDocumentsContext, BrowseDocumentsEvent>({
    id: 'browse-documents',
    initial: 'loading',
    context: {
      documents: [],
    },
    states: {
      loading: {
        entry: ['clearError'],
        invoke: {
          src: 'listDocuments',
          onDone: 'fulfilled',
          onError: 'error'
        }
      },

      fulfilled: {
        entry: ['assignResults'],
        on: {
          query: { target: 'loading' },
        }
      },

      error: {
        entry: ['assignError'],
        on: {
          query: { target: 'loading' }
        }
      }
    }
  }, {
    services: {
      async listDocuments(context, event) {
        return await gateway.listDocuments();
      }
    },

    actions: {
      assignResults: assign({
        documents: (_, event) => (event as ErrorPlatformEvent).data,
      }),

      assignError: assign({
        error: (_, event) => (event as ErrorEvent).error
      }),

      clearError: assign(({ error, ...ctx }) => ctx),
    }
  });
}


export type BrowseDocumentsMachine = ReturnType<typeof makeBrowseDocumentsMachine>;