import React from 'react';
import { useMeasure } from 'react-use';


export type AppBarContextValue = {
  primary: React.RefObject<HTMLDivElement>,
  secondary: React.RefObject<HTMLDivElement>,
  tertiary: React.RefObject<HTMLDivElement>,
  measure: Pick<DOMRectReadOnly, 'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'>
}


export const AppBarContext = React.createContext<AppBarContextValue>({
  // @ts-ignore
  primary: React.createRef<HTMLDivElement>(),
  // @ts-ignore
  secondary: React.createRef<HTMLDivElement>(),
  // @ts-ignore
  tertiary: React.createRef<HTMLDivElement>(),

  measure: {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: 0,
    width: 0
  }
});


