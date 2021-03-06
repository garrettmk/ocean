import { ClientDocumentsGateway } from "@/client/interfaces";
import { assertEventType, Observable } from "@/client/utils";
import { ContentMigrationManager, Document, ID, UpdateDocumentInput } from "@/domain";
import { Subscribable, Sender, sendParent, assign, createMachine, DoneInvokeEvent, ErrorPlatformEvent, EventObject, Interpreter, State, StateMachine, ActorRef, spawn } from 'xstate';
import { pipe, map, toObservable, toPromise } from '@/client/utils';


// Describes the machine's context
export type DocumentEditorMachineContext = {
  document?: Document,
  conversions?: string[],
  error?: Error,
  getDocumentRef?: ActorRef<any>
};

// Event types, for reference in this file
type OpenDocumentEvent = { type: 'openDocument', payload: ID };
type EditDocumentEvent = { type: 'editDocument', payload: UpdateDocumentInput };
type ConvertDocumentEvent = { type: 'convertDocument' };
type ConfirmConvertDocumentEvent = { type: 'confirmConvertDocument', payload: string };
type SaveDocumentEvent = { type: 'saveDocument' };
type DeleteDocumentEvent = { type: 'deleteDocument' };
type ConfirmDeleteDocumentEvent = { type: 'confirmDeleteDocument' };
type CloneDocumentEvent = { type: 'cloneDocument' };
type CancelEvent = { type: 'cancel' };

export type DocumentEditorEvent = 
  | OpenDocumentEvent
  | EditDocumentEvent
  | ConvertDocumentEvent
  | ConfirmConvertDocumentEvent
  | SaveDocumentEvent
  | DeleteDocumentEvent
  | ConfirmDeleteDocumentEvent
  | CloneDocumentEvent
  | CancelEvent
  | DoneInvokeEvent<any>
  | ErrorPlatformEvent


// Describes the various states the machine can be in
export type DocumentEditorStateSchema = {
  states: {
    closed: {},
    openingDocument: {
      states: {
        opening: {}
      }
    },
    ready: {
      states: {
        pristine: {},
        edited: {}
      }
    },
    savingDocument: {
      states: {
        saving: {}
      }
    },
    convertingDocument: {
      states: {
        fetchingMigrationPaths: {},
        confirming: {},
        converting: {},
      }
    },
    deletingDocument: {
      states: {
        confirming: {},
        deleting: {},
      }
    }
  }
};

// Describes the machine's context in various states
export type DocumentEditorTypeState = 
  | {
    value: 
      | 'closed'
      | { openingDocument: 'openingDocument' },
    
    context: {
      document: undefined,
      error?: Error
    }
  }
  | {
    value:
      | 'ready'
      | { ready: 'pristine' }
      | { ready: 'edited' }
      | 'savingDocument'
      | { savingDocument: 'saving' }
      | 'convertingDocument'
      | { convertingDocument: 'fetchingMigrationPaths' }
      | 'deletingDocument'
      | { deletingDocument: 'confirming' }
      | { deletingDocument: 'deleting' }
    context: {
      document: Document,
      error?: Error
    }
  }
  | {
    value:
      | { convertingDocument: 'confirming' }
      | { convertingDocument: 'converting' },
    context: {
      document: Document,
      conversions: string[],
      error?: Error
    }
  };

// High-level types for convenience
export type DocumentEditorMachine = StateMachine<DocumentEditorMachineContext, DocumentEditorStateSchema, DocumentEditorEvent, DocumentEditorTypeState>;
export type DocumentEditorMachineState = State<DocumentEditorMachineContext, DocumentEditorEvent, DocumentEditorStateSchema, DocumentEditorTypeState>;
export type DocumentEditorMachineDispatch = Sender<DocumentEditorEvent>;
export type DocumentEditorService = Interpreter<DocumentEditorMachineContext, DocumentEditorStateSchema, DocumentEditorEvent, DocumentEditorTypeState>;


// Create a machine using the given dependencies
export function makeDocumentEditorMachine(gateway: ClientDocumentsGateway, migrations: ContentMigrationManager, openDocumentId?: ID) : DocumentEditorMachine {
  // @ts-ignore
  return createMachine<DocumentEditorMachineContext, DocumentEditorEvent, DocumentEditorTypeState>({
    id: 'document-editor',
    context: {},
    initial: openDocumentId ? 'openingDocument' : 'closed',
    states: {
      closed: {
        on: {
          openDocument: { target: 'openingDocument' }
        }
      },

      openingDocument: {
        entry: ['spawnGetDocument'],
        on: {
          getDocumentResult: { target: '#document-editor.ready.pristine', actions: ['assignGetDocumentResult'] }
        }
      },

      ready: {
        states: {
          hist: { type: 'history' },
          pristine: {},
          edited: {
            on: {
              saveDocument: { target: '#document-editor.savingDocument' },
            }
          },
        },
        on: {
          editDocument: { target: '#document-editor.ready.edited', actions: ['assignEditEvent'] },
          convertDocument: { target: '#document-editor.convertingDocument' },
          deleteDocument: { target: '#document-editor.deletingDocument' },
          openDocument: { target: '#document-editor.openingDocument' },
        }
      },

      savingDocument: {
        initial: 'saving',
        states: {
          saving: {
            invoke: {
              src: 'saveDocument',
              onDone: { target: '#document-editor.ready.pristine', actions: ['assignSaveDocumentResult'] },
              onError: { target: '#document-editor.ready.edited', actions: ['assignError'] },
            }
          }
        }
      },

      convertingDocument: {
        initial: 'fetchingMigrationPaths',
        states: {
          fetchingMigrationPaths: {
            invoke: {
              src: 'listContentConversions',
              onDone: { target: 'confirming', actions: ['assignListContentConversionsResult'] },
              onError: { target: '#document-editor.ready.hist', actions: ['assignError'] },
            }
          },

          confirming: {
            on: {
              confirmConvertDocument: { target: 'converting' },
              cancel: { target: '#document-editor.ready.hist', actions: ['assignError'] }
            }
          },

          converting: {
            invoke: {
              src: 'convertDocument',
              onDone: { target: '#document-editor.ready.edited', actions: ['assignConvertDocumentResult'] },
              onError: { target: '#document-editor.ready.hist', actions: ['assignError'] }
            }
          }
        }
      },

      deletingDocument: {
        initial: 'confirming',
        states: {
          confirming: {
            on: {
              confirmDeleteDocument: { target: 'deleting' },
              cancel: { target: '#document-editor.ready.hist' }
            }
          },

          deleting: {
            invoke: {
              src: 'deleteDocument',
              onDone: { target: '#document-editor.closed', actions: ['assignDeleteDocumentResult'] },
              onError: { target: '#document-editor.ready.hist', actions: ['assignError'] }
            }
          }
        }
      },
    }
  }, {
    services: {
      async saveDocument(context, event) {
        const { id, title, contentType, content } = context.document!;

        return await pipe(
          gateway.updateDocument(id, { title, contentType, content }),
          toPromise
        );
      },

      async listContentConversions(context, event) {
        const { contentType } = context.document!;

        return pipe(
          gateway.listContentConversions(contentType),
          toPromise
        );
      },

      async convertDocument(context, event) {
        const { contentType, content } = context.document!;
        const to = (event as ConfirmConvertDocumentEvent).payload;

        return pipe(
          gateway.convertContent(content, contentType, to),
          map(newContent => ({ contentType: to, content: newContent })),
          toPromise
        );
      },

      async deleteDocument(context, event) {
        const { id } = context.document!;

        return pipe(
          gateway.deleteDocument(id),
          toPromise
        );
      },
    },

    actions: {
      assignError: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        error: (context, event) => (event as ErrorPlatformEvent).data,
      }),

      assignOpenDocumentResult: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        document: (context, event) => (event as DoneInvokeEvent<Document>).data,
        error: undefined
      }),
      
      assignSaveDocumentResult: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        document: (_, event) => (event as DoneInvokeEvent<Document>).data,
        error: undefined,
      }),
      
      assignEditEvent: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        document: (context, event) => ({
          ...context.document!,
          ...(event as EditDocumentEvent).payload
        }),
      }),

      assignConvertDocumentResult: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        document: (context, event) => ({
          ...context.document!,
          ...(event as DoneInvokeEvent<UpdateDocumentInput>).data
        }),

        conversions: undefined,
        error: undefined,
      }),

      assignDeleteDocumentResult: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        document: undefined,
        error: undefined,
      }),

      assignListContentConversionsResult: assign<DocumentEditorMachineContext, DocumentEditorEvent>({
        conversions: (context, event) => (event as DoneInvokeEvent<string[]>).data
      }),

      spawnGetDocument: assign({
        getDocumentRef: (context, event) => {
          const documentId = event.type === 'xstate.init' ? openDocumentId! : (event as OpenDocumentEvent).payload;
          const observable = pipe(
            gateway.getDocument(documentId),
            map(payload => ({ type: 'getDocumentResult', payload })),
            toObservable
          );

          return spawn(observable);
        }
      }),

      assignGetDocumentResult: assign({
        document: (context, event) => {
          // @ts-ignore
          const document = event.payload as Document;
          return document;
        }
      })
    }
  });
}