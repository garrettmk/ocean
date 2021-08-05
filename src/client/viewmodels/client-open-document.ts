import { Document, ID, UpdateDocumentInput } from '@/domain';
import { ClientDocumentsGateway } from '@/server/interfaces';
import { createMachine, assign, DoneEvent, ErrorPlatformEvent } from 'xstate';


export type OpenDocumentContext = {
  document?: Document,
  error?: Error
}


export type OpenDocumentEvent = 
  | { type: 'open', payload: ID }
  | { type: 'edit', payload: UpdateDocumentInput };
  

export function makeOpenDocumentMachine(gateway: ClientDocumentsGateway) {
  return createMachine<OpenDocumentContext>({
    id: 'open-document',
    initial: 'closed',
    states: {
      closed: {
        on: {
          open: { target: 'opening' }
        }
      },

      opening: {
        invoke: {
          src: 'openDocument',
          onDone: { target: 'open', actions: ['assignDocument'] },
          onError: { target: 'closed', actions: ['assignError'] },
        }
      },

      open: {
        on: {
          edit: { target: 'edited', actions: ['assignEdits'] }
        }
      },

      edited: {
        on: {
          edit: { target: 'edited', internal: false }
        }
      },

      saving: {
        invoke: {
          src: 'saveDocument',
          onDone: { target: 'open', actions: ['assignDocument'] },
          onError: { target: 'edited', actions: ['assignError'] }
        }
      }
    }
  }, {
    services: {
      async saveDocument(context, event) {
        // Use the gateway
      },

      async openDocument(context, event) {
        // Use the gateway
      },
    },

    actions: {
      assignDocument: assign({
        document: (ctx, event) => event.data,
      }),

      assignError: assign({
        error: (ctx, event) => event.error
      })
    }
  })
}