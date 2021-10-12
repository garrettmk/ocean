import { State, StateMachine, createMachine, sendParent } from "xstate";


export type TextContentEditorContext = {
  
  content: string
 };


 export type ChangeTextEvent = { type: 'change', value: string };

 export type TextContentEditorEvent =
  | ChangeTextEvent;


export type TextContentEditorStates = { 
  states: {
    ready: {}
  }
 };


export type TextContentEditorTypeStates =
 | {
   value: 'ready',
   context: {
     content: string
   }
  };


export type TextContentEditorMachine = StateMachine<TextContentEditorContext, TextContentEditorStates, TextContentEditorEvent, TextContentEditorTypeStates>;
export type TextContentEditorMachineState = State<TextContentEditorContext, TextContentEditorEvent, TextContentEditorStates, TextContentEditorTypeStates>;


export function makeTextContentEditorMachine() {
  return createMachine<TextContentEditorContext, TextContentEditorEvent, TextContentEditorTypeStates>({
    id: 'text-editor',
    initial: 'ready',
    context: {
      content: '',
    },
    states: {
      ready: {
        on: {
          change: { actions: ['sendEditEvent'] }
        }
      }
    }
  }, {
    actions: {
      sendEditEvent: sendParent((context, event) => ({
        type: 'editDocument',
        payload: {
          content: (event as ChangeTextEvent).value
        }
      }))
    }
  });
}