import { ContentMigrationManager, Document, DocumentHeader, DocumentGraph, DocumentGraphQuery, DocumentLink, ID, CreateDocumentInput, UpdateDocumentInput } from "@/domain";
import { spawn, Interpreter, createMachine, assign, DoneInvokeEvent, ErrorPlatformEvent, State, EventObject, ActorRef } from "xstate";
import { stop } from "xstate/lib/actions";
import { DocumentEditorEvent, DocumentEditorMachineState } from ".";
import { ClientDocumentsGateway } from "../interfaces";
import { assertEventType, makeELK, elkNodeToDoc, elkEdgeToLink, docToElkNode, linkToElkEdge } from "../utils";
import { makeDocumentEditorMachine } from './document-editor-machine';

// Should this be a dependency?
const elk = makeELK();

// Describe the machine's context
export type GraphEditorContext = {
  graph?: DocumentGraph,
  error?: Error,
  selectedDocuments: ID[],
  editors?: Record<string, ActorRef<DocumentEditorEvent, DocumentEditorMachineState>>
};

// Describe the context in various states
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
    value: 'linkingDocuments' | 'unlinkingDocuments' | 'importingUrl' | 'creatingDocument' | 'updatingDocument' | 'layingOutGraph',
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

// Event types, for use in this file
type LoadGraphEvent = { type: 'loadGraph', payload: DocumentGraphQuery };
type LinkDocumentsEvent = { type: 'linkDocuments', payload?: Partial<DocumentLink>};
type UnlinkDocumentsEvent = { type: 'unlinkDocuments' };
type DeleteDocumentEvent = { type: 'deleteDocument', payload: ID };
type RemoveDocumentEvent = { type: 'removeDocument', payload: ID };
type SelectDocumentEvent = { type: 'selectDocument', payload: ID };
type ImportUrlEvent = { type: 'importUrl', payload: string };
type CreateDocumentEvent = { type: 'createDocument', payload: CreateDocumentInput };
type UpdateDocumentEvent = { type: 'updateDocument', payload: UpdateDocumentInput & Pick<Document, 'id'> };
type LayoutGraphEvent = { type: 'layoutGraph' };
type CancelEvent = { type: 'cancel' };

type EditDocumentEvent = { type: 'editDocument', payload: ID };
type CloseEditorEvent = { type: 'closeEditor', payload: ID };
type ChildUpdateEvent = { type: 'documentChanged', payload: Document };
type DocumentDeletedEvent = { type: 'documentDeleted', payload: ID };

// Main event type
export type GraphEditorEvent = 
  | LoadGraphEvent
  | LinkDocumentsEvent
  | UnlinkDocumentsEvent
  | DeleteDocumentEvent
  | RemoveDocumentEvent
  | SelectDocumentEvent
  | ImportUrlEvent
  | CreateDocumentEvent
  | UpdateDocumentEvent
  | LayoutGraphEvent
  | CancelEvent
  | DoneInvokeEvent<any>
  | EditDocumentEvent
  | CloseEditorEvent
  | ChildUpdateEvent
  | DocumentDeletedEvent;


// High-level types for convenient use
export type GraphEditorMachine = ReturnType<typeof makeGraphEditorMachine>;
export type GraphEditorMachineState = State<GraphEditorContext, GraphEditorEvent, GraphEditorTypeState>;
export type GraphEditorMachineDispatch = Interpreter<GraphEditorContext, GraphEditorMachineState, GraphEditorEvent, GraphEditorTypeState>['send'];

// The default context value
const defaultInitialContext: GraphEditorContext = {
  selectedDocuments: []
}


// Create and return a machine, using the given dependencies
export function makeGraphEditorMachine(
  gateway: ClientDocumentsGateway,
  migrations: ContentMigrationManager,
  initialContext: GraphEditorContext = defaultInitialContext
) {
  return createMachine<GraphEditorContext, GraphEditorEvent, GraphEditorTypeState>({
    id: 'graph-editor',
    context: initialContext,
    initial: 'idle',
    on: {
      documentChanged: { actions: 'handleChildUpdate' }
    },
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
          selectDocument: { actions: ['assignSelectDocument'] },
          loadGraph: { target: 'loading' },
          linkDocuments: { target: 'linkingDocuments' },
          unlinkDocuments: { target: 'unlinkingDocuments' },
          importUrl: { target: 'importingUrl' },
          createDocument: { target: 'creatingDocument' },
          deleteDocument: { target: 'deletingDocument' },
          removeDocument: { actions: ['assignRemoveDocument'] },
          updateDocument: { target: 'updatingDocument' },
          layoutGraph: { target: 'layingOutGraph' },
          editDocument: { actions: 'startEditor' },
          closeEditor: { actions: 'closeEditor' },
          documentDeleted: { actions: ['assignRemoveDocument'] },
        }
      },

      linkingDocuments: {
        entry: ['assignFromLinkDocumentsEvent'],
        initial: 'selectingFromDocument',
        states: {
          selectingFromDocument: {
            always: [
              { cond: 'hasToAndFrom', target: 'linking' },
              { cond: 'hasFrom', target: 'selectingToDocument' }
            ],
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
      },

      importingUrl: {
        initial: 'importing',
        states: {
          importing: {
            invoke: {
              src: 'importUrl',
              onDone: { target: '#graph-editor.ready', actions: ['assignNewDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] },
            }
          }
        }
      },

      creatingDocument: {
        initial: 'creating',
        states: {
          creating: {
            invoke: {
              src: 'createDocument',
              onDone: { target: '#graph-editor.ready', actions: ['assignNewDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      deletingDocument: {
        initial: 'deleting',
        states: {
          deleting: {
            invoke: {
              src: 'deleteDocument',
              onDone: { target: '#graph-editor.ready', actions: ['assignDeleteDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      updatingDocument: {
        initial: 'updating',
        states: {
          updating: {
            invoke: {
              src: 'updateDocument',
              onDone: { target: '#graph-editor.ready', actions: ['assignUpdatedDocument'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },

      layingOutGraph: {
        initial: 'working',
        states: {
          working: {
            invoke: {
              src: 'layoutGraph',
              onDone: { target: '#graph-editor.ready', actions: ['assignGraph'] },
              onError: { target: '#graph-editor.ready', actions: ['assignError'] }
            }
          }
        }
      },
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
      },

      async importUrl(context, event) {
        assertEventType<ImportUrlEvent>(event, 'importUrl');
        const url = event.payload;

        return await gateway.importDocumentFromUrl(url);
      },

      async createDocument(context, event) {
        assertEventType<CreateDocumentEvent>(event, 'createDocument');
        const input = event.payload;
        return await gateway.createDocument(input);
      },

      async deleteDocument(context, event) {
        assertEventType<DeleteDocumentEvent>(event, 'deleteDocument');
        const id = event.payload;

        return await gateway.deleteDocument(id);
      },

      async updateDocument(context, event) {
        assertEventType<UpdateDocumentEvent>(event, 'updateDocument');
        const { id, ...input } = event.payload;

        return await gateway.updateDocument(id, input);
      },

      async layoutGraph(context, event) {
        assertEventType<LayoutGraphEvent>(event, 'layoutGraph');
        
        // Describe the graph in ELK JSON format and tell elk to lay it out
        const layout = await elk.layout({
          id: 'root',
          layoutOptions: { 'algorithm': 'layered', 'elk.direction': 'DOWN' },
          children: (context.graph?.documents ?? []).map(docToElkNode),
          edges: (context.graph?.links ?? []).map(linkToElkEdge)
        });

        // Transform the elk layout back into docs/links
        const newGraph: DocumentGraph = {
          documents: layout.children!.map(elkNodeToDoc),
          links: layout.edges!.map(elkEdgeToLink),
        };

        return newGraph;
      }
    },


    actions: {
      assignGraph: assign({
        graph: (context, event) => (event as DoneInvokeEvent<DocumentGraph>).data
      }),

      assignError: assign({
        error: (context, event) => (event as ErrorPlatformEvent).data
      }),

      assignSelectDocument: assign({
        selectedDocuments: (context, event) => [(event as SelectDocumentEvent).payload],
      }),

      assignFromLinkDocumentsEvent: assign({
        selectedDocuments: (context, event) => {
          const { from , to } = (event as LinkDocumentsEvent).payload ?? {};
          return (
            from && to ? [from, to] :
            from ? [from] :
            []
          );
        }
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

      assignNewDocument: assign({
        graph: (context, event) => {
          assertEventType<DoneInvokeEvent<Document>>(event, ['done.invoke.importUrl', 'done.invoke.createDocument']);
          const { content, ...header } = event.data;

          return {
            documents: [...context.graph!.documents, header],
            links: context.graph!.links
          };
        },
      }),

      assignDeleteDocument: assign({
        graph: (context, event) => {
          assertEventType<DoneInvokeEvent<Document>>(event, 'done.invoke.deleteDocument');
          const { id } = event.data;

          return {
            documents: context.graph!.documents.filter(doc => doc.id != id),
            links: context.graph!.links.filter(link => ![link.from, link.to].includes(id))
          };
        }
      }),

      assignRemoveDocument: assign({
        graph: (context, event) => {
          assertEventType<RemoveDocumentEvent>(event, ['removeDocument', 'documentDeleted']);
          const id = event.payload;

          return {
            documents: context.graph!.documents.filter(doc => doc.id !== id),
            links: context.graph!.links.filter(link => ![link.from, link.to].includes(id))
          };
        }
      }),

      assignUpdatedDocument: assign({
        graph: (context, event) => {
          assertEventType<DoneInvokeEvent<Document>>(event, 'done.invoke.updateDocument');
          const { content, ...header } = event.data;

          return {
            documents: context.graph!.documents.filter(doc => doc.id !== header.id).concat([header]),
            links: context.graph!.links
          };
        }
      }),

      startEditor: assign({
        // @ts-ignore
        editors: (context, event) => {
          assertEventType<EditDocumentEvent>(event, 'editDocument');
          const id = event.payload;
          const actor = context.editors?.[id] ?? spawn(makeDocumentEditorMachine(gateway, migrations, id), id);

          return {
            ...context.editors,
            [id]: actor
          }
        }
      }),

      closeEditor: stop<GraphEditorContext, GraphEditorEvent>((context, event) => 
        context.editors?.[(event as CloseEditorEvent).payload]!
      ),

      handleChildUpdate: assign({
        graph: (context, event) => {
          assertEventType<ChildUpdateEvent>(event, 'documentChanged');
          const { content, ...header } = event.payload;

          return {
            documents: context.graph!.documents.filter(doc => doc.id !== header.id).concat([header]),
            links: context.graph!.links,
          }
      }})
    },

    guards: {
      hasFrom: (context, event) => {
        return context.selectedDocuments.length === 1;
      },

      hasToAndFrom: (context, event) => {
        return context.selectedDocuments.length === 2;
      }
    }
  });
}