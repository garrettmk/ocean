import { GraphEditorContext, GraphEditorEvent, GraphEditorTypeState } from '@/client/viewmodels';
import React from 'react';
import { Interpreter, State } from 'xstate';


export type GraphEditorContextValue = {
  state: State<GraphEditorContext, GraphEditorEvent, any, GraphEditorTypeState>,
  send: Interpreter<GraphEditorContext, any, GraphEditorEvent, GraphEditorTypeState>['send'],
}


// @ts-ignore
export const DocumentGraphContext = React.createContext<GraphEditorContextValue>();