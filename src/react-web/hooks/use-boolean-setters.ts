import React from 'react';


export type UseStateReturnValue = [
  any,
  (v: any) => void
];

export type UseBooleanSettersReturnValue = [
  boolean,
  () => void,
  () => void,
];

export function useBooleanSetters([value, setValue]: UseStateReturnValue) : UseBooleanSettersReturnValue {
  const setTrue = React.useCallback(() => setValue(true), [setValue]);
  const setFalse = React.useCallback(() => setValue(false), [setValue]);

  return [value, setTrue, setFalse];
}