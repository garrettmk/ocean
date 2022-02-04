import { ClientDocumentsGateway } from "@/client/interfaces";
import { assertEventType, pipe, map, toObservable } from "@/client/utils";
import { GraphContent } from "@/content";
import { CreateDocumentInput, Document, DocumentGraph, DocumentGraphQuery } from "@/domain";
import { mergeGraphContent, docToGraphNode, documentGraphToGraphContent, addNode } from "@/react-web/editors/graph-content-editor";
import { assign, createMachine, DoneInvokeEvent, ErrorPlatformEvent, Interpreter, State, StateMachine, ActorRef, AnyEventObject, spawn } from "xstate";


// The machine's context data
export type GraphRouteContext = {
  loadGraph?: ActorRef<AnyEventObject>,
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
type LoadGraphResultEvent = { type: 'loadGraphResult', payload: DocumentGraph };
type CreateDocumentEvent = { type: 'createDocument', payload: CreateDocumentInput };
type ContentChangedEvent = { type: 'contentChanged', payload: GraphContent };
type XStateEvents = DoneInvokeEvent<DocumentGraph> | DoneInvokeEvent<Document> | ErrorPlatformEvent;


// Aggregate event type
export type GraphRouteEvent =
  | QueryEvent
  | LoadGraphResultEvent
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
        contentChanged: { actions: ['assignNewContent'] },
        loadGraphResult: { actions: ['assignLoadGraphResult'] }
      },
      states: {
        ready: {
          on: {
            // query: { target: 'loading' },
            query: { actions: ['spawnLoadGraph'] }
          }
        },

        loading: {
          entry: ['spawnLoadGraph'],
          on: {
            loadGraphResult: { target: 'ready', actions: ['assignLoadGraphResult'] }
          }
        }
      }
    }, {
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

        spawnLoadGraph: assign({
          loadGraph: (context, event) => {
            assertEventType<QueryEvent>(event, 'query');
            const query = event.payload;

            const observable = pipe(
              gateway.graphByQuery(query),
              map(result => ({ type: 'loadGraphResult', payload: result })),
              toObservable
            );

            context.loadGraph?.stop?.();
            return spawn(observable);
          }
        }),

        assignLoadGraphResult: assign({
          content: (context, event) => {
            assertEventType<LoadGraphResultEvent>(event, 'loadGraphResult');
            const documentGraph = event.payload;
            const newContent = documentGraphToGraphContent(documentGraph);

            return mergeGraphContent(context.content, newContent);
          }
        })
      }
    });
  }