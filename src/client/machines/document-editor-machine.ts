import { ClientDocumentsGateway } from "@/client/interfaces";
import { assertEventType } from "@/client/utils";
import { ContentMigrationManager, Document, ID, UpdateDocumentInput } from "@/domain";
import { Sender, sendParent, assign, createMachine, DoneInvokeEvent, ErrorPlatformEvent, EventObject, Interpreter, State, StateMachine } from 'xstate';


// Describes the machine's context
export type DocumentEditorMachineContext = {
  document?: Document,
  conversions?: string[],
  error?: Error
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
        initial: 'opening',
        states: {
          opening: {
            invoke: {
              src: 'openDocument',
              onDone: { target: '#document-editor.ready.pristine', actions: ['assignOpenDocumentResult'] },
              onError: { target: '#document-editor.closed', actions: ['assignError'] }
            }
          }
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
      async openDocument(context, event) {
        if (event.type === 'xstate.init' && openDocumentId)
          return await gateway.getDocument(openDocumentId);

        assertEventType<OpenDocumentEvent>(event, 'openDocument');
        const { payload: id } = event;

        return await gateway.getDocument(id);
      },

      async saveDocument(context, event) {
        const document = context.document!;

        return await gateway.updateDocument(document.id, {
          title: document.title,
          contentType: document.contentType,
          content: document.content
        });
      },

      async listContentConversions(context, event) {
        const document = context.document!;
        const contentTypes = await gateway.listContentConversions(document.contentType);

        return contentTypes;
      },

      async convertDocument(context, event) {
        const document = context.document!;
        const to = (event as ConfirmConvertDocumentEvent).payload;
        
        const newContent = await gateway.convertContent(document.content, document.contentType, to);
        return {
          contentType: to,
          content: newContent
        };
      },

      async deleteDocument(context, event) {
        const id = context.document!.id;

        return await gateway.deleteDocument(id);
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
      })
    }
  });
}