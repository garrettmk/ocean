import React from 'react';


export type UseFocusOptions<T extends HTMLElement> = {
  ref?: React.RefObject<T>,
  in?: (event: React.FocusEvent) => void,
  out?: (event: React.FocusEvent) => void,
}

export type UseFocusReturnValue<T extends HTMLElement> = {
  hasFocus: boolean,
  focusElementRef: React.RefObject<T>,
  focusElementProps: {
    onFocus: (event: React.FocusEvent) => void,
    onBlur: (event: React.FocusEvent) => void
  },
}

export function useFocus<T extends HTMLElement = HTMLElement>(options?: UseFocusOptions<T>) : UseFocusReturnValue<T> {
  const focusElementRef = React.useMemo(() => options?.ref ?? React.createRef<T>(), [options?.ref]);
  const [hasFocus, setHasFocus] = React.useState(false);  
  const focusElementProps = React.useMemo(() => ({
    onFocus: (event: React.FocusEvent) => {
      setHasFocus(true);
      options?.in?.(event);
    },
    onBlur: (event: React.FocusEvent) => {
      setHasFocus(false);
      options?.out?.(event);
    }
  }), [setHasFocus, options?.in, options?.out]);

  return {
    hasFocus,
    focusElementRef,
    focusElementProps
  };
}