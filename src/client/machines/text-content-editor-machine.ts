import { assertEventType } from "@/client/utils";
import { State, StateMachine, createMachine, sendParent, assign, Interpreter } from "xstate";


export type TextContentEditorContext = {
  contentType: string
  content: string
};


export type SetContentEvent = { type: 'setContent', payload: string };
export type SetContentTypeEvent = { type: 'setContentType', payload: string };

export type TextContentEditorEvent =
  | SetContentTypeEvent
  | SetContentEvent;


export type TextContentEditorStates = {
  states: {
    ready: {}
  }
};


export type TextContentEditorTypeStates =
  | {
    value: 'ready',
    context: {
      contentType: string,
      content: string
    }
  };


export type TextContentEditorMachine = StateMachine<TextContentEditorContext, TextContentEditorStates, TextContentEditorEvent, TextContentEditorTypeStates>;
export type TextContentEditorMachineState = State<TextContentEditorContext, TextContentEditorEvent, TextContentEditorStates, TextContentEditorTypeStates>;
export type TextContentEditorService = Interpreter<TextContentEditorContext, TextContentEditorStates, TextContentEditorEvent, TextContentEditorTypeStates>;

export function makeTextContentEditorMachine(initial?: Partial<TextContentEditorContext>) : TextContentEditorMachine {
  // @ts-ignore
  return createMachine<TextContentEditorContext, TextContentEditorEvent, TextContentEditorTypeStates>({
    id: 'text-editor',
    initial: 'ready',
    context: {
      contentType: 'text/plain',
      content: '',
      ...initial
    },
    states: {
      ready: {
        on: {
          setContent: { actions: ['assignNewContent'] },
          setContentType: { actions: ['assignNewContentType'] }
        }
      }
    }
  }, {
    actions: {
      assignNewContent: assign({
        content: (context, event) => {
          assertEventType<SetContentEvent>(event, 'setContent');
          return event.payload;
        }
      }),

      assignNewContentType: assign({
        contentType: (context, event) => {
          assertEventType<SetContentTypeEvent>(event, 'setContentType');
          return event.payload;
        }
      })
    }
  });
}