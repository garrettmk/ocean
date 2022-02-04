import React from 'react';


export type AppBarContextValue = {
  ref: React.RefObject<HTMLDivElement>,
  measure: Pick<DOMRectReadOnly, 'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'>
}


export const AppBarContext = React.createContext<AppBarContextValue>({
  // @ts-ignore
  ref: React.createRef<HTMLDivElement>(),
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


