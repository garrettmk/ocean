import React from 'react';
import { AppBarContext } from './app-bar-context';


export function useAppBar() {
  return React.useContext(AppBarContext);
}