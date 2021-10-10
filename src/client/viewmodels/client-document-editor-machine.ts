import { Document, ID, UpdateDocumentInput } from '@/domain';
import { ClientDocumentsGateway } from '@/client/interfaces';
import { createMachine, assign, DoneEvent, ErrorPlatformEvent, DoneInvokeEvent } from 'xstate';
import { assertEventType } from '../utils';


export type DocumentEditorMachineContext = {
  document?: Document,
  error?: Error
}

export type OpenEvent = { type: 'open', payload: ID };
export type ImportEvent = { type: 'import', payload: string };
export type EditEvent = { type: 'edit', payload: UpdateDocumentInput };
export type SaveEvent = { type: 'save' };
export type DocumentEditorEvent = 
  | OpenEvent
  | ImportEvent
  | EditEvent
  | SaveEvent;


export type DocumentEditorTypeState =
  | {
    value: 'closed' | 'opening' | 'importing',
    context: {
      document: undefined,
      error?: Error
    }
  }
  | {
    value: 'open' | 'edited' | 'saving',
    context: {
      document: Document,
      error?: Error
    }
  };
  

export function makeDocumentEditorMachine(gateway: ClientDocumentsGateway) {
  return createMachine<DocumentEditorMachineContext, DocumentEditorEvent, DocumentEditorTypeState>({
    id: 'document-editor',
    initial: 'closed',
    states: {
      closed: {
        on: {
          open: { target: 'opening' },
          import: { target: 'importing' }
        }
      },

      opening: {
        invoke: {
          src: 'openDocument',
          onDone: { target: 'open', actions: ['assignDocument'] },
          onError: { target: 'closed', actions: ['assignError'] },
        }
      },

      importing: {
        invoke: {
          src: 'importDocument',
          onDone: { target: 'open', actions: ['assignDocument'] },
          onError: { target: 'closed', actions: ['assignError'] }
        }
      },

      open: {
        on: {
          open: { target: 'opening' },
          import: { target: 'importing' },
          edit: { target: 'edited', actions: ['assignEdits'] }
        }
      },

      edited: {
        on: {
          edit: { actions: ['assignEdits'] },
          save: { target: 'saving' },
          open: { target: 'opening' },
          import: { target: 'importing' },
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
        assertEventType<OpenEvent>(event, 'open');
        const id = event.payload;

        return await gateway.getDocument(id);
      },
    },

    actions: {
      assignDocument: assign({
        document: (ctx, event) => {
          assertEventType<DoneInvokeEvent<Document>>(event, 'done.invoke.openDocument');
          return event.data;
        },
      }),

      assignError: assign({
        error: (ctx, event) => {
          assertEventType<ErrorPlatformEvent>(event, 'error.platform');
          return event.data;
        },
      }),

      assignEdits: assign({
        document: (ctx, event) => {
          assertEventType<EditEvent>(event, 'edit');
          return { ...ctx.document, ...event.payload } as Document;
        },
      })
    }
  })
}

function assertHasDocument(ctx: DocumentEditorMachineContext) : asserts ctx is ({ document: Document, error?: Error }) {
  if (!ctx.document)
    throw new Error('document is undefined');
}