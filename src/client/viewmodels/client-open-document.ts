import { Document, ID, UpdateDocumentInput } from '@/domain';
import { ClientDocumentsGateway } from '@/client/interfaces';
import { createMachine, assign, DoneEvent, ErrorPlatformEvent } from 'xstate';


export type OpenDocumentContext = {
  document?: Document,
  error?: Error
}

type HasDocumentContext = {
  document: Document,
  error?: Error,
}

function assertHasDocument(ctx: OpenDocumentContext) : asserts ctx is HasDocumentContext {
  if (!ctx.document)
    throw new Error('document is undefined');
}


export type OpenDocumentEvent = 
  | { type: 'open', payload: ID }
  | { type: 'edit', payload: UpdateDocumentInput }
  | { type: 'save' };
  

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
          open: { target: 'opening' },
          edit: { target: 'edited', actions: ['assignEdits'] }
        }
      },

      edited: {
        on: {
          edit: { actions: ['assignEdits'] },
          save: { target: 'saving' },
          open: { target: 'opening' }
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
        assertHasDocument(context);
        const { document } = context;

        return await gateway.updateDocument(document.id, {
          title: document.title,
          contentType: document.contentType,
          content: document.content
        });
      },

      async openDocument(context, event) {
        const id = event.payload;

        return await gateway.getDocument(id);
      },
    },

    actions: {
      assignDocument: assign({
        document: (ctx, event) => event.data,
      }),

      assignError: assign({
        error: (ctx, event) => event.error
      }),

      assignEdits: assign({
        document: (ctx, event) => ({ ...ctx.document, ...event.payload })
      })
    }
  })
}