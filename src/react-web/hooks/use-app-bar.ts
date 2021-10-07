import React from 'react';
import { AppBarContext } from '../contexts';


export function useAppBar() {
  return React.useContext(AppBarContext);
}