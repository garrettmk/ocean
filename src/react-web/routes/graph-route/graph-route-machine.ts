import { ClientDocumentsGateway } from "@/client/interfaces";
import { assertEventType } from "@/client/utils";
import { GraphContent } from "@/content";
import { CreateDocumentInput, Document, DocumentGraph, DocumentGraphQuery } from "@/domain";
import { docToGraphNode, documentGraphToGraphContent, addNode } from "@/react-web/editors/graph-content-editor";
import { assign, createMachine, DoneInvokeEvent, ErrorPlatformEvent, Interpreter, State, StateMachine } from "xstate";


// The machine's context data
export type GraphRouteContext = {
  contentType: 'ocean/graph',
  content: GraphContent,
  error?: Error
}


// Describe the machine states
export type GraphRouteStateSchema = {
  states: {
    ready: {},
    loadingGraph: {},
    creatingDocument: {},
  }
}

// Describe the context in the different states
export type GraphRouteTypeState =
  | {
    value: 'ready' | 'loadingGraph' | 'creatingDocument',
    context: {
      contentType: 'ocean/graph',
      content: GraphContent,
      error?: Error
    }
  }

// Event types, for use in this file
type QueryEvent = { type: 'query', payload: DocumentGraphQuery };
type CreateDocumentEvent = { type: 'createDocument', payload: CreateDocumentInput };
type ContentChangedEvent = { type: 'contentChanged', payload: GraphContent };
type XStateEvents = DoneInvokeEvent<DocumentGraph> | DoneInvokeEvent<Document> | ErrorPlatformEvent;


// Aggregate event type
export type GraphRouteEvent =
  | QueryEvent
  | CreateDocumentEvent
  | ContentChangedEvent;


  // High-level types for convenience
  export type GraphRouteMachine = StateMachine<GraphRouteContext, GraphRouteStateSchema, GraphRouteEvent, GraphRouteTypeState>;
  export type GraphRouteState = State<GraphRouteContext, GraphRouteEvent, GraphRouteStateSchema, GraphRouteTypeState>;
  export type GraphRouteService = Interpreter<GraphRouteContext, GraphRouteStateSchema, GraphRouteEvent, GraphRouteTypeState>;


  // Create and return a machine, using the given dependencies
  export function makeGraphRouteMachine(gateway: ClientDocumentsGateway) : GraphRouteMachine {
    // @ts-ignore
    return createMachine<GraphRouteContext, GraphRouteEvent | XStateEvents, GraphRouteTypeState>({
      id: 'graph-route',
      context: {
        contentType: 'ocean/graph',
        content: {
          nodes: [],
          edges: []
        }
      },
      initial: 'ready',
      on: {
        contentChanged: {
          actions: ['assignNewContent']
        }
      },
      states: {
        ready: {
          on: {
            query: { target: 'loadingGraph' },
            createDocument: { target: 'creatingDocument' }
          }
        },
        loadingGraph: {
          invoke: {
            src: 'loadGraph',
            onDone: { target: 'ready', actions: ['assignLoadGraphResult', 'clearError'] },
            onError: { target: 'ready', actions: ['assignError'] },
          }
        },
        creatingDocument: {
          invoke: {
            src: 'createDocument',
            onDone: { target: 'ready', actions: ['assignCreateDocumentResult', 'clearError'] },
            onError: { target: 'ready', actions: ['assignError']}
          }
        }
      }
    }, {
      services: {
        async loadGraph(context, event) {
          assertEventType<QueryEvent>(event, 'query');
          const query = event.payload;

          return await gateway.graphByQuery(query);
        },

        async createDocument(context, event) {
          assertEventType<CreateDocumentEvent>(event, 'createDocument');
          const input = event.payload;

          return await gateway.createDocument(input);
        }
      },
      actions: {
        assignError: assign({
          error: (_, event) => (event as ErrorPlatformEvent).data
        }),

        clearError: assign({
          error: (_) => undefined
        }),

        assignNewContent: assign({
          content: (context, event) => {
            assertEventType<ContentChangedEvent>(event, 'contentChanged');
            const newContent = event.payload;

            return newContent;
          }
        }),

        assignLoadGraphResult: assign({
          content: (context, event) => {
            // assertEventType<DoneInvokeEvent<DocumentGraph>>(event, 'done.invoke.loadGraph');
            const documentGraph = (event as DoneInvokeEvent<DocumentGraph>).data;

            return documentGraphToGraphContent(documentGraph);
          }
        }),

        assignCreateDocumentResult: assign({
          content: (context, event) => {
            const document = (event as DoneInvokeEvent<Document>).data;
            const newNode = docToGraphNode(document);
            const newContent = addNode(context.content, newNode);

            return newContent;
          }
        }),
      }
    });
  }