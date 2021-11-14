import { GraphEditorMachine, GraphEditorContext, GraphEditorEvent, GraphEditorTypeState } from '@/client/viewmodels';
import { DocumentGraphContext, GraphEditorContextValue } from '@/react-web/contexts';
import { useMachine } from '@xstate/react';
import React from 'react';
import { State, Interpreter } from 'xstate';


export type GraphEditorProviderProps = React.PropsWithChildren<{
  state: State<GraphEditorContext, GraphEditorEvent, any, GraphEditorTypeState>,
  send: Interpreter<GraphEditorContext, any, GraphEditorEvent, GraphEditorTypeState>['send']
}>;


export function GraphEditorProvider({
  state,
  send,
  children
}: GraphEditorProviderProps) : JSX.Element {
  
  const value = React.useMemo<GraphEditorContextValue>(() => ({
    state,
    send
  }), [state, send]);

  return <DocumentGraphContext.Provider {...{ value, children } }/>;
}