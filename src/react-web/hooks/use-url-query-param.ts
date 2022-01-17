import React from 'react';


export function useUrlQueryParam(name: string, defaultValue: any = null) : [string | null, (v: any) => void] {
  // Start with the current value, and update if it changes
  const [value, setValue] = React.useState(getQueryParam(name) ?? defaultValue);
  useHistoryStateListener(() => setValue(getQueryParam(name) ?? defaultValue), [name]);

  // Curry setQueryParam using the given param name
  const setter = React.useCallback((newValue: any) => {
    setQueryParam(name, newValue);
    setValue(getQueryParam(name));
  }, [name]);

  return [value, setter];
}

export function useUrlQueryParamArray(name: string) : [string[], (v: any[] | null) => void] {
  // Start with the current value, and update if it changes externally
  const [value, setValue] = React.useState(getQueryParamArray(name));
  useHistoryStateListener(() => setValue(getQueryParamArray(name)), [name]);

  // Curry setQueryParam using the given param name
  const setter = React.useCallback((newValue: any[] | null) => setQueryParam(name, newValue), [name]);

  return [value, setter];
}

export function useUrlQueryParamBoolean(name:string, defaultValue: boolean | null = null) : [boolean, (v: boolean | null) => void] {
  const [stringValue, setter] = useUrlQueryParam(name, defaultValue as unknown as string);
  const booleanValue = stringValue == 'false' ? false : Boolean(stringValue);
  return [booleanValue, setter];
}


function useHistoryStateListener(onChange: () => void, deps: any[]) {
  React.useEffect(() => {
    window.addEventListener('popstate', onChange);
    window.addEventListener('pushstate', onChange);
    window.addEventListener('replacestate', onChange);

    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('pushstate', onChange);
      window.removeEventListener('replacestate', onChange);
    };
  }, deps);
}

function getQueryParam(name: string) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getQueryParamArray(name: string) {
  const params = new URLSearchParams(window.location.search);
  return params.getAll(name);
}

function setQueryParam(name: string, value: any) {
  const params = new URLSearchParams(window.location.search);

  if (value === null || value == undefined)
    params.delete(name);
  else
    params.set(name, value as any);

  window.history.pushState(null, window.document.title, `?${params.toString()}`);
}